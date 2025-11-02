import https from 'https';
import type { IncomingMessage } from 'http';

/**
 * GitHub API または raw.githubusercontent.com から HTTPS GET リクエストを実行する共通関数
 *
 * @param url リクエスト先の完全な URL
 * @param options オプション設定
 * @returns レスポンスボディの文字列
 * @throws Error - リソースが見つからない場合（404）、レート制限、その他のHTTPエラー、ネットワークエラー
 */
export async function fetchFromGitHub(
  url: string,
  options: {
    /** 404 エラー時のカスタムリソース名（エラーメッセージに使用） */
    resourceName?: string;
    /** 404 や他のエラーを無視して null を返すか（デフォルト: false） */
    ignoreErrors?: boolean;
  } = {}
): Promise<string | null> {
  const { resourceName, ignoreErrors = false } = options;

  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'airc-cli'
      }
    }, (res) => {
      // 404 Not Found
      if (res.statusCode === 404) {
        if (ignoreErrors) {
          resolve(null);
          return;
        }
        reject(new Error(`リソースが見つかりません: ${resourceName || url}`));
        return;
      }

      // 403 Forbidden (GitHub API レート制限)
      if (res.statusCode === 403) {
        if (ignoreErrors) {
          resolve(null);
          return;
        }
        const resetTime = Array.isArray(res.headers['x-ratelimit-reset'])
          ? res.headers['x-ratelimit-reset'][0]
          : res.headers['x-ratelimit-reset'];
        const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : new Date();
        reject(new Error(`GitHub API のレート制限に達しました。次の時刻以降に再試行してください: ${resetDate.toLocaleString()}`));
        return;
      }

      // その他の HTTP エラー
      if (res.statusCode !== 200) {
        if (ignoreErrors) {
          resolve(null);
          return;
        }
        reject(new Error(`GitHub API エラー (${res.statusCode})`));
        return;
      }

      // レスポンスボディの読み取り
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (error) => {
      if (ignoreErrors) {
        resolve(null);
        return;
      }
      reject(new Error(`ネットワークエラー: ${error.message}`));
    });
  });
}

/**
 * ファイルサイズ制限付きダウンロード結果
 */
export interface DownloadResponse {
  /** HTTP ステータスコード */
  statusCode: number;
  /** レスポンスボディ（成功時のみ） */
  data?: string;
  /** エラー理由（エラー時のみ） */
  errorReason?: string;
}

/**
 * ファイルサイズ制限付きで GitHub からファイルをダウンロードする
 *
 * @param url ダウンロード先の完全な URL
 * @param maxSize 最大ファイルサイズ（バイト単位）
 * @returns ダウンロード結果
 */
export async function downloadFromGitHub(
  url: string,
  maxSize: number
): Promise<DownloadResponse> {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'airc-cli'
      }
    }, (res: IncomingMessage) => {
      // HTTP ステータスコードの確認
      if (res.statusCode !== 200) {
        resolve({
          statusCode: res.statusCode ?? 0,
          errorReason: `HTTP ${res.statusCode}`
        });
        return;
      }

      // Content-Length ヘッダーでファイルサイズをチェック
      const contentLength = res.headers['content-length'];
      if (contentLength) {
        const fileSize = parseInt(contentLength, 10);
        if (fileSize > maxSize) {
          res.destroy(); // ダウンロードを中止
          resolve({
            statusCode: 413, // Payload Too Large
            errorReason: `ファイルサイズ超過 (${(fileSize / 1024 / 1024).toFixed(2)}MB)`
          });
          return;
        }
      }

      // レスポンスのストリーム処理
      let data = '';
      let downloadedSize = 0;

      res.on('data', (chunk: Buffer) => {
        downloadedSize += chunk.length;

        // ストリーム中のサイズチェック（Content-Length がない場合の対策）
        if (downloadedSize > maxSize) {
          res.destroy(); // ダウンロードを中止
          resolve({
            statusCode: 413, // Payload Too Large
            errorReason: `ファイルサイズ超過 (${(downloadedSize / 1024 / 1024).toFixed(2)}MB)`
          });
          return;
        }

        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: 200,
          data
        });
      });
    }).on('error', (error: Error) => {
      resolve({
        statusCode: 0,
        errorReason: `ネットワークエラー: ${error.message}`
      });
    });
  });
}
