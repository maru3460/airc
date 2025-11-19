import type { Manifest } from '../types.js';
import { fetchFromGitHub } from '../http/fetch.js';
import { getRepoConfig } from '../utils/config.js';

/**
 * マニフェストファイル (files.json) を取得する
 * @param profile プロファイル名 (例: "default")
 * @returns マニフェストオブジェクト、存在しない場合は null
 */
export async function fetchManifest(profile: string): Promise<Manifest | null> {
  const repo = await getRepoConfig();
  const manifestPath = `profiles/${profile}/files.json`;
  const rawUrl = `https://raw.githubusercontent.com/${repo.owner}/${repo.name}/${repo.branch}/${manifestPath}`;

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
