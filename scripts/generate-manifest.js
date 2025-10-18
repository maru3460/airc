#!/usr/bin/env node

/**
 * マニフェストファイル (files.json) 自動生成スクリプト
 *
 * projects/ 配下の各プロジェクトディレクトリを走査し、
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

const PROJECTS_DIR = join(__dirname, '../projects');
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
 * プロジェクトのマニフェストを生成
 * @param {string} projectName - プロジェクト名
 * @param {string} projectDir - プロジェクトディレクトリのパス
 */
async function generateManifest(projectName, projectDir) {
  try {
    // プロジェクトディレクトリ配下のファイルを取得
    const files = await getFilesRecursively(projectDir, projectDir);

    // パス変換: projects/{project}/ プレフィックスを除去済み（相対パスで取得しているため）
    // ファイルリストをソート（安定性のため）
    files.sort();

    // マニフェストオブジェクトを作成
    const manifest = {
      version: MANIFEST_VERSION,
      files: files
    };

    // JSON として保存
    const manifestPath = join(projectDir, 'files.json');
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

    console.log(`✅ ${projectName}: ${files.length} ファイルを検出しました`);
    console.log(`   → ${manifestPath}`);
  } catch (error) {
    console.error(`❌ ${projectName}: マニフェスト生成に失敗しました`);
    console.error(`   エラー: ${error.message}`);
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('🔍 projects/ 配下を走査しています...\n');

  try {
    // projects/ ディレクトリの存在確認
    const projectsStat = await stat(PROJECTS_DIR);
    if (!projectsStat.isDirectory()) {
      console.error('❌ projects/ がディレクトリではありません');
      process.exit(1);
    }

    // projects/ 配下のプロジェクトディレクトリを取得
    const entries = await readdir(PROJECTS_DIR, { withFileTypes: true });
    const projects = entries.filter(entry => entry.isDirectory());

    if (projects.length === 0) {
      console.log('⚠️  プロジェクトが見つかりませんでした');
      return;
    }

    // 各プロジェクトのマニフェストを生成
    for (const project of projects) {
      const projectDir = join(PROJECTS_DIR, project.name);
      await generateManifest(project.name, projectDir);
    }

    console.log('\n✨ マニフェスト生成が完了しました！');
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

main();
