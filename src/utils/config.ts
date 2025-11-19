import { promises as fs } from 'fs';
import * as path from 'path';
import { AIRC_DIR, CONFIG_FILE, DEFAULT_PROFILE, DEFAULT_REPO_BRANCH, DEFAULT_REPO_NAME, DEFAULT_REPO_OWNER, SYNC_FILE } from '../config.js';
import { EMOJI } from '../emoji.js';
import type { LocalConfig, RepoConfig } from '../types.js';
import { profileExists, listLocalProfiles, createProfile } from './profiles.js';
import { readSyncPatterns, isSyncFileValid, initSyncFile } from './syncPatterns.js';
import { saveToProfile } from './syncFiles.js';
import { INVALID_CONFIG_MESSAGE, INVALID_SYNC_MESSAGE, UNINITIALIZED_MESSAGE, INVALID_CONFIG_CONTENT_MESSAGE } from '../messages.js';

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
    repo: {
      owner: DEFAULT_REPO_OWNER,
      name: DEFAULT_REPO_NAME,
      branch: DEFAULT_REPO_BRANCH,
    },
  };
}

/**
 * `.airc/config.json` を読み込む
 * ファイルが存在しない場合はデフォルト設定を返す
 */
export async function readLocalConfig(): Promise<LocalConfig> {
  const configPath = getConfigPath();

  const content = await fs.readFile(configPath, 'utf-8');
  const config = JSON.parse(content) as LocalConfig;

  // マイグレーション: repo がない場合はデフォルト値を設定
  if (!config.repo) {
    config.repo = {
      owner: DEFAULT_REPO_OWNER,
      name: DEFAULT_REPO_NAME,
      branch: DEFAULT_REPO_BRANCH,
    };
    await writeLocalConfig(config);
  }

  return config;
}

/**
 * リポジトリ設定を取得
 */
export async function getRepoConfig(): Promise<RepoConfig> {
  const config = await readLocalConfig();
  return config.repo;
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

/**
 * `.airc` が初期化済みかチェック
 * 初期化されていない場合はエラーを投げる
 * config.json と .sync の存在と正常に読み込めるかも検証する
 */
export async function ensureInitialized(): Promise<void> {
  // .airc/ ディレクトリの存在チェック
  if (!(await isInitialized())) {
    throw new Error(UNINITIALIZED_MESSAGE);
  }

  // config.json の存在と読み込みチェック（マイグレーションも実行）
  let config: LocalConfig;
  try {
    config = await readLocalConfig();
  } catch (error) {
    throw new Error(INVALID_CONFIG_MESSAGE);
  }

  // config.json の内容を検証
  if (!(await isConfigValid(config))) {
    throw new Error(INVALID_CONFIG_CONTENT_MESSAGE);
  }

  // .sync の存在チェック
  const syncFilePath = path.join(process.cwd(), AIRC_DIR, SYNC_FILE);
  let syncContent: string;
  try {
    await fs.access(syncFilePath);
    syncContent = await fs.readFile(syncFilePath, 'utf-8');
  } catch (error) {
    throw new Error(INVALID_SYNC_MESSAGE);
  }
}

/**
 * config.json を検証する
 * @param config - 検証対象の設定
 * @returns 検証結果（有効な場合は true）
 */
export async function isConfigValid(config: LocalConfig): Promise<boolean> {
  // currentの検証
  if (!config.current || config.current.trim() === '' || !(await profileExists(config.current))) {
    return false;
  }

  // repoの検証
  if (!config.repo) {
    return false;
  }
  if (typeof config.repo.owner !== 'string' || config.repo.owner.trim() === '') {
    return false;
  }
  if (typeof config.repo.name !== 'string' || config.repo.name.trim() === '') {
    return false;
  }
  if (typeof config.repo.branch !== 'string' || config.repo.branch.trim() === '') {
    return false;
  }

  return true;
}

/**
 * 一意な tmp プロファイル名を生成
 * @returns tmp, tmp(1), tmp(2), ... の形式で一意な名前
 */
export async function generateUniqueTmpProfileName(): Promise<string> {
  const profiles = await listLocalProfiles();

  // "tmp" が存在しない場合
  if (!profiles.includes('tmp')) {
    return 'tmp';
  }

  // "tmp(1)", "tmp(2)", ... を試す
  for (let counter = 1; ; counter++) {
    const candidate = `tmp(${counter})`;
    if (!profiles.includes(candidate)) {
      return candidate;
    }
  }
}

/**
 * config.json を修復する
 * 1. tmpプロファイルを作成
 * 2. .syncに従い、実ファイルをtmpプロファイルに保存
 * 3. currentがtmpであるconfig.jsonを作成
 * @returns 新しく作成されたプロファイル名
 */
export async function repairConfig(): Promise<string> {
  if (await isSyncFileValid() === false) {
    throw new Error(`${EMOJI.ERROR} .sync が不正です。\``);
  }

  const tmpProfileName = await generateUniqueTmpProfileName();

  await createProfile(tmpProfileName);

  const patterns = await readSyncPatterns();
  await saveToProfile(tmpProfileName, patterns);

  const newConfig: LocalConfig = {
    current: tmpProfileName,
    repo: {
      owner: DEFAULT_REPO_OWNER,
      name: DEFAULT_REPO_NAME,
      branch: DEFAULT_REPO_BRANCH,
    },
  };
  await writeLocalConfig(newConfig);

  return tmpProfileName;
}
