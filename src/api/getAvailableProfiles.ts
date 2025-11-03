import { GITHUB_API_BASE, REPO_OWNER, REPO_NAME } from '../config.js';
import type { GitHubContentItem } from '../types.js';
import { fetchFromGitHub } from '../http/fetch.js';

/**
 * GitHub API を使用して利用可能なプロファイル一覧を取得する
 * @returns プロファイル名の配列
 */
export async function getAvailableProfiles(): Promise<string[]> {
  const apiUrl = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/profiles`;

  try {
    const data = await fetchFromGitHub(apiUrl, { resourceName: 'profiles' });

    if (data === null) {
      throw new Error('Failed to fetch profiles');
    }

    const items: GitHubContentItem[] = JSON.parse(data);

    // ディレクトリのみを抽出してプロファイル名のリストを作成
    const profiles = items
      .filter(item => item.type === 'dir')
      .map(item => item.name);

    return profiles;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`レスポンスのパースに失敗しました: ${error}`);
    }
    throw error;
  }
}
