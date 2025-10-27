import { GITHUB_RAW_BASE, REPO_OWNER, REPO_NAME, REPO_BRANCH, MAX_FILE_SIZE } from '../config.js';
import { fileExists, askOverwrite, ensureDir, saveFile } from '../utils/fs.js';
import { isValidPath, toLocalPath } from '../utils/path.js';
import { downloadFromGitHub } from '../utils/http.js';
import type { DownloadResult } from '../types.js';
import { PathValidationError } from '../errors.js';

/**
 * GitHub からファイルをダウンロードする
 *
 * @param filePath GitHub リポジトリ内のファイルパス
 * @param profile プロファイル名
 * @param force 強制上書きフラグ
 * @returns ダウンロード結果（成功、スキップ、エラー + エラー理由）
 */
export async function downloadFile(
  filePath: string,
  profile: string,
  force: boolean
): Promise<DownloadResult> {
  // raw.githubusercontent.com の URL 生成
  const rawUrl = `${GITHUB_RAW_BASE}/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${filePath}`;

  // ローカルパスの生成
  const localPath = toLocalPath(filePath, profile);

  // README.md は除外
  if (localPath.endsWith('README.md')) {
    return { status: 'skipped' };
  }

  // パスバリデーション（セキュリティチェック）
  if (!isValidPath(localPath)) {
    const error = new PathValidationError(localPath);
    console.log(`✗ ${error.message}`);
    return { status: 'error', reason: error.message };
  }

  // ファイル存在チェック
  const exists = await fileExists(localPath);

  // 既存ファイルの上書き確認処理
  if (exists && !force) {
    const shouldOverwrite = await askOverwrite(localPath);
    if (!shouldOverwrite) {
      console.log(`⊘ スキップ: ${localPath}`);
      return { status: 'skipped' };
    }
  }

  // 親ディレクトリの作成
  await ensureDir(localPath);

  // ファイルサイズ制限付きでダウンロードを実行
  const response = await downloadFromGitHub(rawUrl, MAX_FILE_SIZE);

  // エラーチェック
  if (response.statusCode !== 200) {
    if (response.statusCode === 413) {
      // ファイルサイズ超過
      console.log(
        `✗ ファイルサイズ超過 ${localPath}: ${response.errorReason} (上限: ${MAX_FILE_SIZE / 1024 / 1024}MB)`
      );
    } else {
      // その他のエラー
      console.log(`✗ ダウンロード失敗 ${localPath}: ${response.errorReason}`);
    }
    return { status: 'error', reason: response.errorReason || 'Unknown error' };
  }

  // ファイルへの書き込み
  try {
    await saveFile(localPath, response.data!);
    console.log(`✓ ダウンロード完了: ${localPath}`);
    return { status: 'success' };
  } catch (error) {
    console.log(`✗ 書き込み失敗 ${localPath}: ${error}`);
    return { status: 'error', reason: `書き込み失敗: ${error}` };
  }
}
