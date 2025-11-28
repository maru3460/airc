import { getGitHubToken } from '../auth/github.js';

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
    // トークンを取得（オプション）
    const token = await getGitHubToken();

    // ヘッダーを構築
    const headers: Record<string, string> = {
      'User-Agent': 'airc-cli'
    };

    // トークンがあれば Authorization ヘッダーを追加
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    const response = await fetch(url, { headers });

    // 401 Unauthorized
    if (response.status === 401) {
      if (ignoreErrors) {
        return null;
      }
      throw new Error('認証に失敗しました。トークンが無効または期限切れの可能性があります。');
    }

    // 404 Not Found
    if (response.status === 404) {
      if (ignoreErrors) {
        return null;
      }
      throw new Error(`リソースが見つかりません: ${resourceName || url}`);
    }

    // 403 Forbidden (GitHub API レート制限または権限不足)
    if (response.status === 403) {
      if (ignoreErrors) {
        return null;
      }
      const resetTime = response.headers.get('x-ratelimit-reset');
      if (resetTime) {
        const resetDate = new Date(parseInt(resetTime) * 1000);
        throw new Error(`GitHub API のレート制限に達しました。次の時刻以降に再試行してください: ${resetDate.toLocaleString()}`);
      }
      throw new Error('リソースへのアクセス権限がありません。プライベートリポジトリの場合は、適切なスコープを持つトークンを設定してください。');
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
