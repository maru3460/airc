import { getRepoConfig } from '../utils/config.js';

/**
 * config.json から GitHub Personal Access Token を取得
 * @returns トークン（設定されていない場合は undefined）
 */
export async function getGitHubToken(): Promise<string | undefined> {
  const repoConfig = await getRepoConfig();
  return repoConfig.token;
}

/**
 * トークンをマスクして表示用の文字列に変換
 * @param token GitHub Personal Access Token
 * @returns マスクされたトークン（例: "ghp_****...xyz"）
 */
export function maskToken(token: string): string {
  if (token.length <= 7) {
    return '****';
  }
  // 最初の4文字と最後の3文字を表示、それ以外は * でマスク
  const prefix = token.slice(0, 4);
  const suffix = token.slice(-3);
  return `${prefix}****...${suffix}`;
}
