import { promises as fs } from 'fs';
import * as path from 'path';
import { AIRC_DIR, PROFILES_DIR } from '../config.js';

/**
 * `.airc/profiles/` のフルパスを取得
 */
function getProfilesDir(): string {
  return path.join(process.cwd(), AIRC_DIR, PROFILES_DIR);
}

/**
 * 指定されたプロファイルのディレクトリパスを取得
 * @param name - プロファイル名
 * @returns プロファイルディレクトリのフルパス
 */
export function getProfilePath(name: string): string {
  return path.join(getProfilesDir(), name);
}

/**
 * ローカルプロファイルの一覧を取得
 * @returns プロファイル名のリスト
 */
export async function listLocalProfiles(): Promise<string[]> {
  const profilesDir = getProfilesDir();

  try {
    const entries = await fs.readdir(profilesDir, { withFileTypes: true });

    // ディレクトリのみをフィルタリング
    const profiles = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    return profiles;
  } catch (error) {
    // ディレクトリが存在しない場合は空配列を返す
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    // その他のエラーはそのまま投げる
    throw error;
  }
}

/**
 * 指定されたプロファイルが存在するかチェック
 * @param name - プロファイル名
 * @returns 存在する場合は true
 */
export async function profileExists(name: string): Promise<boolean> {
  const profilePath = getProfilePath(name);

  try {
    const stat = await fs.stat(profilePath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

/**
 * 新しいプロファイルディレクトリを作成
 * @param name - プロファイル名
 */
export async function createProfile(name: string): Promise<void> {
  const profilePath = getProfilePath(name);
  await fs.mkdir(profilePath, { recursive: true });
}

/**
 * プロファイルディレクトリを削除
 * @param name - プロファイル名
 */
export async function deleteProfile(name: string): Promise<void> {
  const profilePath = getProfilePath(name);
  await fs.rm(profilePath, { recursive: true, force: true });
}

/**
 * プロファイル名を検証（無効な文字を含まないかチェック）
 * @param name - プロファイル名
 * @returns 有効な場合は true
 */
export function isValidProfileName(name: string): boolean {
  // 空文字列は無効
  if (!name || name.trim() === '') {
    return false;
  }

  // パストラバーサル攻撃を防ぐため、'/' や '..' を含むものは無効
  if (name.includes('/') || name.includes('\\') || name.includes('..')) {
    return false;
  }

  // 特殊なディレクトリ名（'.' や '..'）は無効
  if (name === '.' || name === '..') {
    return false;
  }

  // その他の制限（オプション）
  // - 先頭が '.' で始まるものは無効
  // - 制御文字を含むものは無効
  if (name.startsWith('.') || /[\x00-\x1f]/.test(name)) {
    return false;
  }

  return true;
}
