import { promises as fs } from 'fs';
import * as path from 'path';
import { AIRC_DIR, CONFIG_FILE, DEFAULT_PROFILE } from '../config.js';
import type { LocalConfig } from '../types.js';

/**
 * `.airc/config.json` のフルパスを取得
 */
function getConfigPath(): string {
  return path.join(process.cwd(), AIRC_DIR, CONFIG_FILE);
}

/**
 * `.airc` ディレクトリのフルパスを取得
 */
function getAircDirPath(): string {
  return path.join(process.cwd(), AIRC_DIR);
}

/**
 * デフォルトの設定を生成
 */
function getDefaultConfig(): LocalConfig {
  return {
    current: DEFAULT_PROFILE,
  };
}

/**
 * `.airc/config.json` を読み込む
 * ファイルが存在しない場合はデフォルト設定を返す
 */
export async function readLocalConfig(): Promise<LocalConfig> {
  const configPath = getConfigPath();

  try {
    const content = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(content) as LocalConfig;
    return config;
  } catch (error) {
    // ファイルが存在しない場合はデフォルト設定を返す
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return getDefaultConfig();
    }
    // その他のエラーはそのまま投げる
    throw error;
  }
}

/**
 * `.airc/config.json` に設定を書き込む
 */
export async function writeLocalConfig(config: LocalConfig): Promise<void> {
  const configPath = getConfigPath();
  const aircDir = getAircDirPath();

  // `.airc` ディレクトリを作成（recursive: true で親ディレクトリも作成）
  await fs.mkdir(aircDir, { recursive: true, mode: 0o755 });

  // 設定をJSON形式で保存
  const content = JSON.stringify(config, null, 2) + '\n';
  await fs.writeFile(configPath, content, 'utf-8');
}

/**
 * `.airc/config.json` を初期化
 * デフォルト設定を書き込む
 */
export async function initLocalConfig(): Promise<void> {
  const config = getDefaultConfig();
  await writeLocalConfig(config);
}

/**
 * `.airc` ディレクトリが初期化済みかチェック
 */
export async function isInitialized(): Promise<boolean> {
  const aircDir = getAircDirPath();
  try {
    await fs.access(aircDir);
    return true;
  } catch {
    return false;
  }
}
