/**
 * ファイル同期ユーティリティ
 * プロファイルと実ファイル間のファイル同期機能を提供
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { isValidPath } from "./path.js";
import { ensureDir, saveFile, fileExists, moveFile } from "./fs.js";
import { readSyncPatterns, matchFiles } from "./syncPatterns.js";
import { getProfilePath, profileExists } from "./profiles.js";
import type { SyncPattern } from "../types.js";
import { EMOJI } from "../emoji.js";
import { AIRC_DIR, STASH_DIR } from "../config.js";

/**
 * 実ファイルをプロファイルに保存
 * @param profileName - 保存先プロファイル名
 * @param patterns - 同期パターン（省略時は .sync から読み込み）
 */
export async function saveToProfile(
  profileName: string,
  patterns: SyncPattern,
): Promise<void> {
  const cwd = process.cwd();

  // プロファイルの存在確認
  if (!(await profileExists(profileName))) {
    throw new Error(
      `${EMOJI.WARNING} プロファイル "${profileName}" が存在しません。airc new ${profileName} で作成してください。`
    );
  }

  // 実ファイルのリストを取得
  const files = await matchFiles(patterns, cwd);

  const profilePath = getProfilePath(profileName);

  for (const file of files) {
    try {
      // パス検証（セキュリティチェック）
      if (!isValidPath(file)) {
        console.warn(`${EMOJI.WARNING} スキップ: 無効なパス "${file}"`);
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
    } catch (error) {
      // 個別ファイルのエラーは警告して続行
      console.warn(`${EMOJI.WARNING} ファイル保存失敗: ${file} - ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * プロファイルから実ファイルに展開
 * @param profileName - 展開元プロファイル名
 */
export async function restoreFromProfile(
  profileName: string,
): Promise<void> {
  const cwd = process.cwd();

  // プロファイルの存在確認
  if (!(await profileExists(profileName))) {
    throw new Error(
      `${EMOJI.WARNING} プロファイル "${profileName}" が存在しません。`
    );
  }

  const profilePath = getProfilePath(profileName);

  // プロファイル内のファイルリストを取得
  // .sync パターンを読み込んで、プロファイルディレクトリ内でマッチング
  const syncPatterns = await readSyncPatterns();
  const files = await matchFiles(syncPatterns, profilePath);

  for (const file of files) {
    try {
      // パス検証（セキュリティチェック）
      if (!isValidPath(file)) {
        console.warn(
          `${EMOJI.WARNING} スキップ: 無効なパス "${file}"`
        );
        continue;
      }

      const sourcePath = path.join(profilePath, file);
      const targetPath = path.join(cwd, file);

      // 既存ファイルがある場合は .airc/stash/ に避難
      if (await fileExists(targetPath)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const stashDir = path.join(cwd, AIRC_DIR, STASH_DIR, timestamp);
        const backupPath = path.join(stashDir, file);

        try {
          await moveFile(targetPath, backupPath);
          console.log(
            `${EMOJI.INFO} 既存ファイルを避難: "${file}" -> "${path.join(AIRC_DIR, STASH_DIR, timestamp, file)}"`
          );
        } catch (error) {
          console.warn(
            `${EMOJI.WARNING} スキップ - ファイル避難失敗: ${file} - ${error instanceof Error ? error.message : String(error)}`
          );
          continue;
        }
      }

      // ファイル内容を読み込み
      const content = await fs.readFile(sourcePath, "utf-8");

      // 展開先ディレクトリを作成
      await ensureDir(targetPath);

      // ファイルを保存
      await saveFile(targetPath, content);
    } catch (error) {
      // 個別ファイルのエラーは警告して続行
      console.warn(
        `${EMOJI.WARNING} ファイル展開失敗: ${file} - ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

/**
 * 実ファイルを削除（clear コマンド用）
 * @param patterns - 削除パターン（省略時は .sync から読み込み）
 */
export async function clearFiles(
  patterns: SyncPattern,
): Promise<void> {
  const cwd = process.cwd()

  // 実ファイルのリストを取得
  const files = await matchFiles(patterns, cwd);

  for (const file of files) {
    try {
      // パス検証（セキュリティチェック）
      if (!isValidPath(file)) {
        console.warn(
          `${EMOJI.WARNING} スキップ: 無効なパス "${file}"`
        );
        continue;
      }

      const targetPath = path.join(cwd, file);

      // ファイルが存在する場合のみ削除
      if (await fileExists(targetPath)) {
        await fs.unlink(targetPath);
      }
    } catch (error) {
      // 個別ファイルのエラーは警告して続行
      console.warn(
        `${EMOJI.WARNING} ファイル削除失敗: ${file} - ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

