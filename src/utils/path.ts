/**
 * パスにディレクトリトラバーサル攻撃のパターンが含まれているか検証する
 */
export function isValidPath(path: string): boolean {
  return !path.includes('../');
}

/**
 * GitHub リポジトリパスをローカルパスに変換する
 *
 * @param githubPath GitHub リポジトリ内のパス (例: "profiles/default/.github/chatmodes/file.md")
 * @param profile プロファイル名
 * @returns ローカルパス (例: ".github/chatmodes/file.md")
 */
export function toLocalPath(githubPath: string, profile: string): string {
  return githubPath.replace(`profiles/${profile}/`, '');
}
