#!/usr/bin/env node

/**
 * マニフェストファイル (files.json) 自動生成スクリプト
 *
 * profiles/ 配下の各プロジェクトディレクトリを走査し、
 * 含まれるファイルのリストを files.json として保存する。
 *
 * 実行: node scripts/generate-manifest.js
 */

import { readdir, stat, writeFile, mkdir } from 'fs/promises';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECTS_DIR = join(__dirname, '../profiles');
const MANIFEST_VERSION = '1.0';

/**
 * ディレクトリを再帰的に走査してファイルパスのリストを取得
 * @param {string} dir - 走査するディレクトリ
 * @param {string} baseDir - ベースディレクトリ（相対パス計算用）
 * @returns {Promise<string[]>} ファイルパスのリスト
 */
async function getFilesRecursively(dir, baseDir) {
  const files = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        // サブディレクトリを再帰的に走査
        const subFiles = await getFilesRecursively(fullPath, baseDir);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        // files.json 自身は除外
        if (entry.name === 'files.json') {
          continue;
        }

        // ベースディレクトリからの相対パスを計算
        const relativePath = relative(baseDir, fullPath);
        files.push(relativePath);
      }
    }
  } catch (error) {
    // ディレクトリが存在しない場合などはスキップ
    console.error(`⚠️  ディレクトリの読み取りに失敗しました: ${dir}`);
  }

  return files;
}

/**
 * プロファイルのマニフェストを生成
 * @param {string} profileName - プロファイル名
 * @param {string} profileDir - プロファイルディレクトリのパス
 */
async function generateManifest(profileName, profileDir) {
  try {
    // プロファイルディレクトリ配下のファイルを取得
    const files = await getFilesRecursively(profileDir, profileDir);

    // パス変換: profiles/{profile}/ プレフィックスを除去済み（相対パスで取得しているため）
    // ファイルリストをソート（安定性のため）
    files.sort();

    // マニフェストオブジェクトを作成
    const manifest = {
      version: MANIFEST_VERSION,
      files: files
    };

    // JSON として保存
    const manifestPath = join(profileDir, 'files.json');
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

    console.log(`✅ ${profileName}: ${files.length} ファイルを検出しました`);
    console.log(`   → ${manifestPath}`);
  } catch (error) {
    console.error(`❌ ${profileName}: マニフェスト生成に失敗しました`);
    console.error(`   エラー: ${error.message}`);
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('🔍 profiles/ 配下を走査しています...\n');

  try {
    // profiles/ ディレクトリの存在確認
    const projectsStat = await stat(PROJECTS_DIR);
    if (!projectsStat.isDirectory()) {
      console.error('❌ profiles/ がディレクトリではありません');
      process.exit(1);
    }

    // profiles/ 配下のプロファイルディレクトリを取得
    const entries = await readdir(PROJECTS_DIR, { withFileTypes: true });
    const profiles = entries.filter(entry => entry.isDirectory());

    if (profiles.length === 0) {
      console.log('⚠️  プロファイルが見つかりませんでした');
      return;
    }

    // 各プロファイルのマニフェストを生成
    for (const profile of profiles) {
      const profileDir = join(PROJECTS_DIR, profile.name);
      await generateManifest(profile.name, profileDir);
    }

    console.log('\n✨ マニフェスト生成が完了しました！');
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

main();
