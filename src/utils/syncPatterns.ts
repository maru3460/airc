import { promises as fs } from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { AIRC_DIR, SYNC_FILE } from '../config.js';
import type { SyncPattern } from '../types.js';

/**
 * `.airc/.sync` のフルパスを取得
 */
function getSyncFilePath(): string {
  return path.join(process.cwd(), AIRC_DIR, SYNC_FILE);
}

/**
 * デフォルトの `.sync` ファイル内容を生成
 */
export function generateDefaultSyncFile(): string {
  return `# airc sync patterns
# このファイルは、プロファイルと同期するファイルを定義します

# ディレクトリ: そのディレクトリ以下のすべてのファイルを同期
.github/
.claude/
.kiro/

# ファイル: 特定のファイルを同期
CLAUDE.md

# ワイルドカード: パターンマッチング
# *.md
# .github/**/*.md

# 除外パターン: '!' で始まるパターンは除外
!.github/workflows/
!*.log
`;
}

/**
 * `.sync` ファイルをパースして include/exclude パターンを抽出
 */
export function parseSyncFile(content: string): SyncPattern {
  const include: string[] = [];
  const exclude: string[] = [];

  const lines = content.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // 空行とコメントをスキップ
    if (!line || line.startsWith('#')) {
      continue;
    }

    // 除外パターン（'!' で始まる）
    if (line.startsWith('!')) {
      const pattern = line.slice(1).trim();
      if (pattern) {
        exclude.push(pattern);
      }
      continue;
    }

    // 通常のパターン
    include.push(line);
  }

  return { include, exclude };
}

/**
 * `.airc/.sync` ファイルを読み込んでパース
 * ファイルが存在しない場合はデフォルトパターンを返す
 */
export async function readSyncPatterns(): Promise<SyncPattern> {
  const syncFilePath = getSyncFilePath();

  try {
    const content = await fs.readFile(syncFilePath, 'utf-8');
    return parseSyncFile(content);
  } catch (error) {
    // ファイルが存在しない場合はデフォルトパターンを返す
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      const defaultContent = generateDefaultSyncFile();
      return parseSyncFile(defaultContent);
    }
    // その他のエラーはそのまま投げる
    throw error;
  }
}

/**
 * パターンに一致するファイルを取得
 * @param patterns - include/exclude パターン
 * @param cwd - 作業ディレクトリ（デフォルトは process.cwd()）
 * @returns 一致したファイルパスのリスト（cwdからの相対パス）
 */
export async function matchFiles(
  patterns: SyncPattern,
  cwd: string = process.cwd()
): Promise<string[]> {
  const { include, exclude } = patterns;

  if (include.length === 0) {
    return [];
  }

  // 各 include パターンに対してファイルを検索
  const allFiles = new Set<string>();

  for (const pattern of include) {
    // ディレクトリパターン（末尾が '/' の場合）
    let globPattern = pattern;
    if (pattern.endsWith('/')) {
      globPattern = pattern + '**/*';
    }

    try {
      const files = await glob(globPattern, {
        cwd,
        nodir: true, // ディレクトリは除外
        dot: true, // ドットファイルも含める
        ignore: exclude, // 除外パターンを適用
      });

      for (const file of files) {
        allFiles.add(file);
      }
    } catch (error) {
      // glob エラーはスキップ（パターンが不正な場合など）
      console.warn(`⚠️  パターン "${pattern}" の処理中にエラーが発生しました: ${error}`);
    }
  }

  return Array.from(allFiles).sort();
}

/**
 * `.airc/.sync` ファイルを書き込む
 */
export async function writeSyncFile(content: string): Promise<void> {
  const syncFilePath = getSyncFilePath();
  await fs.writeFile(syncFilePath, content, 'utf-8');
}

/**
 * `.airc/.sync` ファイルを初期化（デフォルト内容を書き込む）
 */
export async function initSyncFile(): Promise<void> {
  const content = generateDefaultSyncFile();
  await writeSyncFile(content);
}

/**
 * `.airc/.sync` ファイルを検証する
 * @returns 検証結果（有効な場合は true）
 */
export async function isSyncFileValid(): Promise<boolean> {
  const syncFilePath = getSyncFilePath();

  try {
    await fs.access(syncFilePath);
    await fs.readFile(syncFilePath, 'utf-8');

    return true;
  } catch (error) {
    return false;
  }
}
