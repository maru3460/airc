import { GITHUB_API_BASE } from '../config.js';
import type { GitHubContentItem } from '../types.js';
import { fetchFromGitHub } from '../http/fetch.js';
import { getRepoConfig } from '../utils/config.js';

/**
 * GitHub API を使用してプロファイル配下のファイルリストを取得する
 * @param profile プロファイル名 (例: "default")
 * @returns ファイルパスの配列
 */
export async function getProjectFiles(profile: string): Promise<string[]> {
  const repo = await getRepoConfig();
  const files: string[] = [];

  /**
   * 指定されたパスのディレクトリ内容を再帰的に取得する
   * @param path GitHub リポジトリ内のパス
   */
  async function fetchDirectory(path: string): Promise<void> {
    const apiUrl = `${GITHUB_API_BASE}/repos/${repo.owner}/${repo.name}/contents/${path}`;

    try {
      const data = await fetchFromGitHub(apiUrl, { resourceName: `profiles/${profile}` });

      if (data === null) {
        throw new Error(`Failed to fetch directory: ${path}`);
      }

      const items: GitHubContentItem[] = JSON.parse(data);

      // 各アイテムの処理
      for (const item of items) {
        if (item.type === 'file') {
          // ファイルの場合、リストに追加
          files.push(item.path);
        } else if (item.type === 'dir') {
          // ディレクトリの場合、再帰的に取得
          await fetchDirectory(item.path);
        }
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`レスポンスのパースに失敗しました: ${error}`);
      }
      throw error;
    }
  }

  // プロファイルディレクトリを起点に再帰取得
  await fetchDirectory(`profiles/${profile}`);
  return files;
}
