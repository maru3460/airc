import { GITHUB_API_BASE, REPO_OWNER, REPO_NAME } from '../config.js';
import type { GitHubContentItem, Manifest } from '../types.js';
import { ResponseParseError } from '../errors.js';
import { fetchFromGitHub } from '../utils/http.js';

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
      throw new ResponseParseError(error);
    }
    throw error;
  }
}

/**
 * GitHub API を使用してプロファイル配下のファイルリストを取得する
 * @param profile プロファイル名 (例: "default")
 * @returns ファイルパスの配列
 */
export async function getProjectFiles(profile: string): Promise<string[]> {
  const files: string[] = [];

  /**
   * 指定されたパスのディレクトリ内容を再帰的に取得する
   * @param path GitHub リポジトリ内のパス
   */
  async function fetchDirectory(path: string): Promise<void> {
    const apiUrl = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

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
        throw new ResponseParseError(error);
      }
      throw error;
    }
  }

  // プロファイルディレクトリを起点に再帰取得
  await fetchDirectory(`profiles/${profile}`);
  return files;
}

/**
 * マニフェストファイル (files.json) を取得する
 * @param profile プロファイル名 (例: "default")
 * @returns マニフェストオブジェクト、存在しない場合は null
 */
export async function fetchManifest(profile: string): Promise<Manifest | null> {
  const manifestPath = `profiles/${profile}/files.json`;
  const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${manifestPath}`;

  try {
    // マニフェストが存在しない場合やエラーの場合は null を返す（フォールバック動作）
    const data = await fetchFromGitHub(rawUrl, { ignoreErrors: true });

    if (data === null) {
      return null;
    }

    const manifest: Manifest = JSON.parse(data);

    // バリデーション: version と files が存在するか確認
    if (!manifest.version || !Array.isArray(manifest.files)) {
      return null;
    }

    return manifest;
  } catch (error) {
    // パースエラーの場合もマニフェストなしとして扱う
    return null;
  }
}
