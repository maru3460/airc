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
 * プロファイル名を検証（ホワイトリスト方式）
 * 許可する文字:
 * - 英数字 (a-z, A-Z, 0-9)
 * - ひらがな (ぁ-ん)
 * - カタカナ (ァ-ヶ, ｱ-ﾝ, ﾞ, ﾟ)
 * - 漢字 (一-龠)
 * - 記号 (ハイフン, アンダースコア, 長音符)
 * @param name - プロファイル名
 * @returns 有効な場合は true
 */
export function isValidProfileName(name: string): boolean {
  // 空文字列は無効
  if (!name || name.trim() === '') {
    return false;
  }

  // ホワイトリスト: 英数字、日本語文字、ハイフン、アンダースコア、長音符のみ許可
  // 半角カタカナは ｧ-ﾟ で全範囲（小さい文字、通常文字、濁点・半濁点）をカバー
  const validPattern = /^[a-zA-Z0-9ぁ-んァ-ヶｧ-ﾟ一-龠_\-ー]+$/;

  return validPattern.test(name);
}
