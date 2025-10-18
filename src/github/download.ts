import https from 'https';
import { GITHUB_RAW_BASE, REPO_OWNER, REPO_NAME, REPO_BRANCH } from '../config.js';
import { fileExists, askOverwrite, ensureDir, saveFile } from '../utils/fs.js';
import { isValidPath, toLocalPath } from '../utils/path.js';
import type { DownloadResult } from '../types.js';

/**
 * GitHub からファイルをダウンロードする
 *
 * @param filePath GitHub リポジトリ内のファイルパス
 * @param project プロジェクト名
 * @param force 強制上書きフラグ
 * @returns ダウンロード結果 ('success' | 'skipped' | 'error')
 */
export async function downloadFile(
  filePath: string,
  project: string,
  force: boolean
): Promise<DownloadResult> {
  // raw.githubusercontent.com の URL 生成
  const rawUrl = `${GITHUB_RAW_BASE}/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${filePath}`;

  // ローカルパスの生成
  const localPath = toLocalPath(filePath, project);

  // パスバリデーション
  if (!isValidPath(localPath)) {
    console.log(`✗ 不正なパスが検出されました: ${localPath}`);
    return 'error';
  }

  // ファイル存在チェック
  const exists = await fileExists(localPath);

  // 既存ファイルの上書き確認処理
  if (exists && !force) {
    const shouldOverwrite = await askOverwrite(localPath);
    if (!shouldOverwrite) {
      console.log(`⊘ スキップ: ${localPath}`);
      return 'skipped';
    }
  }

  // 親ディレクトリの作成
  await ensureDir(localPath);

  // HTTP GET リクエストの実行
  return new Promise((resolve) => {
    https.get(rawUrl, (res) => {
      // HTTP ステータスコードの確認
      if (res.statusCode !== 200) {
        console.log(`✗ ダウンロード失敗 ${localPath}: HTTP ${res.statusCode}`);
        resolve('error');
        return;
      }

      // レスポンスのストリーム処理
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', async () => {
        try {
          // ファイルへの書き込み
          await saveFile(localPath, data);
          console.log(`✓ ダウンロード完了: ${localPath}`);
          resolve('success');
        } catch (error) {
          console.log(`✗ 書き込み失敗 ${localPath}: ${error}`);
          resolve('error');
        }
      });
    }).on('error', (error) => {
      console.log(`✗ ダウンロード失敗 ${localPath}: ${error.message}`);
      resolve('error');
    });
  });
}
