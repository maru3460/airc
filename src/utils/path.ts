/**
 * パスにディレクトリトラバーサル攻撃のパターンが含まれているか検証する
 */
export function isValidPath(path: string): boolean {
  return !path.includes('../');
}

/**
 * GitHub リポジトリパスをローカルパスに変換する
 *
 * @param githubPath GitHub リポジトリ内のパス (例: "projects/default/.github/chatmodes/file.md")
 * @param project プロジェクト名
 * @returns ローカルパス (例: ".github/chatmodes/file.md")
 */
export function toLocalPath(githubPath: string, project: string): string {
  return githubPath.replace(`projects/${project}/`, '');
}
