import https from 'https';
import { GITHUB_RAW_BASE, REPO_OWNER, REPO_NAME, REPO_BRANCH, MAX_FILE_SIZE } from '../config.js';
import { fileExists, askOverwrite, ensureDir, saveFile } from '../utils/fs.js';
import { isValidPath, toLocalPath } from '../utils/path.js';
import type { DownloadResult } from '../types.js';

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

  // パスバリデーション
  if (!isValidPath(localPath)) {
    console.log(`✗ 不正なパスが検出されました: ${localPath}`);
    return { status: 'error', reason: '不正なパス' };
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

  // HTTP GET リクエストの実行
  return new Promise((resolve) => {
    https.get(rawUrl, (res) => {
      // HTTP ステータスコードの確認
      if (res.statusCode !== 200) {
        console.log(`✗ ダウンロード失敗 ${localPath}: HTTP ${res.statusCode}`);
        resolve({ status: 'error', reason: `HTTP ${res.statusCode}` });
        return;
      }

      // Content-Length ヘッダーでファイルサイズをチェック
      const contentLength = res.headers['content-length'];
      if (contentLength) {
        const fileSize = parseInt(contentLength, 10);
        if (fileSize > MAX_FILE_SIZE) {
          console.log(
            `✗ ファイルサイズ超過 ${localPath}: ${(fileSize / 1024 / 1024).toFixed(2)}MB (上限: ${MAX_FILE_SIZE / 1024 / 1024}MB)`
          );
          res.destroy(); // ダウンロードを中止
          resolve({ status: 'error', reason: `ファイルサイズ超過 (${(fileSize / 1024 / 1024).toFixed(2)}MB)` });
          return;
        }
      }

      // レスポンスのストリーム処理
      let data = '';
      let downloadedSize = 0;

      res.on('data', (chunk) => {
        downloadedSize += chunk.length;

        // ストリーム中のサイズチェック（Content-Length がない場合の対策）
        if (downloadedSize > MAX_FILE_SIZE) {
          console.log(
            `✗ ファイルサイズ超過 ${localPath}: ${(downloadedSize / 1024 / 1024).toFixed(2)}MB (上限: ${MAX_FILE_SIZE / 1024 / 1024}MB)`
          );
          res.destroy(); // ダウンロードを中止
          resolve({ status: 'error', reason: `ファイルサイズ超過 (${(downloadedSize / 1024 / 1024).toFixed(2)}MB)` });
          return;
        }

        data += chunk;
      });

      res.on('end', async () => {
        try {
          // ファイルへの書き込み
          await saveFile(localPath, data);
          console.log(`✓ ダウンロード完了: ${localPath}`);
          resolve({ status: 'success' });
        } catch (error) {
          console.log(`✗ 書き込み失敗 ${localPath}: ${error}`);
          resolve({ status: 'error', reason: `書き込み失敗: ${error}` });
        }
      });
    }).on('error', (error) => {
      console.log(`✗ ダウンロード失敗 ${localPath}: ${error.message}`);
      resolve({ status: 'error', reason: `ネットワークエラー: ${error.message}` });
    });
  });
}
