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

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'airc-cli'
      }
    });

    // 404 Not Found
    if (response.status === 404) {
      if (ignoreErrors) {
        return null;
      }
      throw new Error(`リソースが見つかりません: ${resourceName || url}`);
    }

    // 403 Forbidden (GitHub API レート制限)
    if (response.status === 403) {
      if (ignoreErrors) {
        return null;
      }
      const resetTime = response.headers.get('x-ratelimit-reset');
      const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : new Date();
      throw new Error(`GitHub API のレート制限に達しました。次の時刻以降に再試行してください: ${resetDate.toLocaleString()}`);
    }

    // その他の HTTP エラー
    if (!response.ok) {
      if (ignoreErrors) {
        return null;
      }
      throw new Error(`GitHub API エラー (${response.status})`);
    }

    return await response.text();
  } catch (error) {
    if (ignoreErrors) {
      return null;
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`ネットワークエラー: ${error}`);
  }
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
