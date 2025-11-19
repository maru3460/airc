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
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'airc-cli'
      }
    });

    // HTTP ステータスコードの確認
    if (!response.ok) {
      return {
        statusCode: response.status,
        errorReason: `HTTP ${response.status}`
      };
    }

    // Content-Length ヘッダーでファイルサイズをチェック
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      const fileSize = parseInt(contentLength, 10);
      if (fileSize > maxSize) {
        return {
          statusCode: 413, // Payload Too Large
          errorReason: `ファイルサイズ超過 (${(fileSize / 1024 / 1024).toFixed(2)}MB)`
        };
      }
    }

    // レスポンスボディの取得
    const data = await response.text();

    return {
      statusCode: 200,
      data
    };
  } catch (error) {
    return {
      statusCode: 0,
      errorReason: `ネットワークエラー: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
