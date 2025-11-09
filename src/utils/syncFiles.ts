/**
 * ファイル同期ユーティリティ
 * プロファイルと実ファイル間のファイル同期機能を提供
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { isValidPath } from "./path.js";
import { ensureDir, saveFile, fileExists } from "./fs.js";
import { readSyncPatterns, matchFiles } from "./syncPatterns.js";
import { getProfilePath, profileExists } from "./profiles.js";
import type { SyncPattern } from "../types.js";
import { EMOJI } from "../emoji.js";

/**
 * 実ファイルをプロファイルに保存
 * @param profileName - 保存先プロファイル名
 * @param patterns - 同期パターン（省略時は .sync から読み込み）
 * @param options - オプション
 */
export async function saveToProfile(
  profileName: string,
  patterns?: SyncPattern,
  options: { force?: boolean; cwd?: string } = {}
): Promise<void> {
  const { force = false, cwd = process.cwd() } = options;

  // プロファイルの存在確認
  if (!(await profileExists(profileName))) {
    throw new Error(
      `プロファイル "${profileName}" が存在しません。airc new ${profileName} で作成してください。`
    );
  }

  // パターン取得（未指定の場合は .sync から読み込み）
  const syncPatterns = patterns ?? (await readSyncPatterns());

  // 実ファイルのリストを取得
  const files = await matchFiles(syncPatterns, cwd);

  if (files.length === 0) {
    console.log(`${EMOJI.INFO} 同期対象のファイルが見つかりませんでした`);
    return;
  }

  console.log(
    `${EMOJI.SYNC} ${files.length} 個のファイルをプロファイル "${profileName}" に保存中...`
  );

  const profilePath = getProfilePath(profileName);
  let savedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    try {
      // パス検証（セキュリティチェック）
      if (!isValidPath(file)) {
        console.warn(
          `${EMOJI.WARNING} スキップ: 無効なパス "${file}"`
        );
        skippedCount++;
        continue;
      }

      const sourcePath = path.join(cwd, file);
      const targetPath = path.join(profilePath, file);

      // ファイル内容を読み込み
      const content = await fs.readFile(sourcePath, "utf-8");

      // 保存先ディレクトリを作成
      await ensureDir(targetPath);

      // ファイルを保存
      await saveFile(targetPath, content);
      savedCount++;
    } catch (error) {
      // 個別ファイルのエラーは警告して続行
      console.warn(
        `${EMOJI.WARNING} ファイル保存失敗: ${file} - ${error instanceof Error ? error.message : String(error)}`
      );
      skippedCount++;
    }
  }

  console.log(
    `${EMOJI.SUCCESS} ${savedCount} 個のファイルを保存しました` +
      (skippedCount > 0 ? ` (${skippedCount} 個スキップ)` : "")
  );
}

/**
 * プロファイルから実ファイルに展開
 * @param profileName - 展開元プロファイル名
 * @param options - オプション
 */
export async function restoreFromProfile(
  profileName: string,
  options: { force?: boolean; cwd?: string } = {}
): Promise<void> {
  const { force = false, cwd = process.cwd() } = options;

  // プロファイルの存在確認
  if (!(await profileExists(profileName))) {
    throw new Error(
      `プロファイル "${profileName}" が存在しません。`
    );
  }

  const profilePath = getProfilePath(profileName);

  // プロファイル内のファイルリストを取得
  // .sync パターンを読み込んで、プロファイルディレクトリ内でマッチング
  const syncPatterns = await readSyncPatterns();
  const files = await matchFiles(syncPatterns, profilePath);

  if (files.length === 0) {
    console.log(
      `${EMOJI.INFO} プロファイル "${profileName}" に展開するファイルがありません`
    );
    return;
  }

  console.log(
    `${EMOJI.SYNC} プロファイル "${profileName}" から ${files.length} 個のファイルを展開中...`
  );

  let restoredCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    try {
      // パス検証（セキュリティチェック）
      if (!isValidPath(file)) {
        console.warn(
          `${EMOJI.WARNING} スキップ: 無効なパス "${file}"`
        );
        skippedCount++;
        continue;
      }

      const sourcePath = path.join(profilePath, file);
      const targetPath = path.join(cwd, file);

      // 上書き確認（force フラグがない場合）
      if (!force && (await fileExists(targetPath))) {
        console.log(
          `${EMOJI.WARNING} スキップ: ファイルが既に存在します "${file}" (--force で上書き可能)`
        );
        skippedCount++;
        continue;
      }

      // ファイル内容を読み込み
      const content = await fs.readFile(sourcePath, "utf-8");

      // 展開先ディレクトリを作成
      await ensureDir(targetPath);

      // ファイルを保存
      await saveFile(targetPath, content);
      restoredCount++;
    } catch (error) {
      // 個別ファイルのエラーは警告して続行
      console.warn(
        `${EMOJI.WARNING} ファイル展開失敗: ${file} - ${error instanceof Error ? error.message : String(error)}`
      );
      skippedCount++;
    }
  }

  console.log(
    `${EMOJI.SUCCESS} ${restoredCount} 個のファイルを展開しました` +
      (skippedCount > 0 ? ` (${skippedCount} 個スキップ)` : "")
  );
}

/**
 * 実ファイルを削除（clear コマンド用）
 * @param patterns - 削除パターン（省略時は .sync から読み込み）
 * @param options - オプション
 */
export async function clearFiles(
  patterns?: SyncPattern,
  options: { cwd?: string } = {}
): Promise<void> {
  const { cwd = process.cwd() } = options;

  // パターン取得（未指定の場合は .sync から読み込み）
  const syncPatterns = patterns ?? (await readSyncPatterns());

  // 実ファイルのリストを取得
  const files = await matchFiles(syncPatterns, cwd);

  if (files.length === 0) {
    console.log(`${EMOJI.INFO} 削除対象のファイルが見つかりませんでした`);
    return;
  }

  console.log(`${EMOJI.SYNC} ${files.length} 個のファイルを削除中...`);

  let deletedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    try {
      // パス検証（セキュリティチェック）
      if (!isValidPath(file)) {
        console.warn(
          `${EMOJI.WARNING} スキップ: 無効なパス "${file}"`
        );
        skippedCount++;
        continue;
      }

      const targetPath = path.join(cwd, file);

      // ファイルが存在する場合のみ削除
      if (await fileExists(targetPath)) {
        await fs.unlink(targetPath);
        deletedCount++;
      } else {
        skippedCount++;
      }
    } catch (error) {
      // 個別ファイルのエラーは警告して続行
      console.warn(
        `${EMOJI.WARNING} ファイル削除失敗: ${file} - ${error instanceof Error ? error.message : String(error)}`
      );
      skippedCount++;
    }
  }

  console.log(
    `${EMOJI.SUCCESS} ${deletedCount} 個のファイルを削除しました` +
      (skippedCount > 0 ? ` (${skippedCount} 個スキップ)` : "")
  );
}

