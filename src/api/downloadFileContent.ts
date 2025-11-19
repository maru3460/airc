import { GITHUB_RAW_BASE, MAX_FILE_SIZE } from '../config.js';
import { downloadFromGitHub } from '../http/download.js';
import type { DownloadResponse } from '../http/download.js';
import { getRepoConfig } from '../utils/config.js';

/**
 * GitHub からファイル内容をダウンロードする（宣言的な道具）
 *
 * @param filePath GitHub リポジトリ内のファイルパス
 * @returns ダウンロードレスポンス
 */
export async function downloadFileContent(
  filePath: string
): Promise<DownloadResponse> {
  const repo = await getRepoConfig();
  const rawUrl = `${GITHUB_RAW_BASE}/${repo.owner}/${repo.name}/${repo.branch}/${filePath}`;
  return await downloadFromGitHub(rawUrl, MAX_FILE_SIZE);
}
