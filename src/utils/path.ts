import { isAbsolute } from 'path';

/**
 * パスにディレクトリトラバーサル攻撃のパターンが含まれているか検証する
 *
 * 検証項目：
 * - ディレクトリトラバーサル（`../` および `..\\`）
 * - 絶対パス
 * - null バイト（\0）
 *
 * @param path 検証対象のパス
 * @returns パスが安全な場合は true、不正な場合は false
 */
export function isValidPath(path: string): boolean {
  // ディレクトリトラバーサルの検出（Unix/Linux形式）
  if (path.includes('../')) {
    return false;
  }

  // ディレクトリトラバーサルの検出（Windows形式）
  if (path.includes('..\\')) {
    return false;
  }

  // 絶対パスの検出（Unix/Linux: /path, Windows: C:\\path）
  if (isAbsolute(path)) {
    return false;
  }

  // null バイトの検出（セキュリティ対策）
  if (path.includes('\0')) {
    return false;
  }

  return true;
}

/**
 * GitHub リポジトリパスをローカルパスに変換する
 *
 * @param githubPath GitHub リポジトリ内のパス (例: "profiles/default/.github/chatmodes/file.md")
 * @param profile プロファイル名
 * @returns ローカルパス (例: ".github/chatmodes/file.md")
 * @throws Error パス変換に失敗した場合（プレフィックスが存在しない、または空パスになる場合）
 */
export function toLocalPath(githubPath: string, profile: string): string {
  const prefix = `profiles/${profile}/`;

  // プレフィックスが存在しない場合はエラー
  if (!githubPath.startsWith(prefix)) {
    throw new Error(`無効なGitHubパス: "${githubPath}" (期待: "${prefix}")`);
  }

  const localPath = githubPath.replace(prefix, '');

  // 空パスの検証
  if (localPath.trim() === '') {
    throw new Error(`パス変換結果が空: "${githubPath}"`);
  }

  return localPath;
}
