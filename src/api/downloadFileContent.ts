import { GITHUB_RAW_BASE, REPO_OWNER, REPO_NAME, REPO_BRANCH, MAX_FILE_SIZE } from '../config.js';
import { downloadFromGitHub } from '../http/download.js';
import type { DownloadResponse } from '../http/download.js';

/**
 * GitHub からファイル内容をダウンロードする（宣言的な道具）
 *
 * @param filePath GitHub リポジトリ内のファイルパス
 * @returns ダウンロードレスポンス
 */
export async function downloadFileContent(
  filePath: string
): Promise<DownloadResponse> {
  const rawUrl = `${GITHUB_RAW_BASE}/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${filePath}`;
  return await downloadFromGitHub(rawUrl, MAX_FILE_SIZE);
}
