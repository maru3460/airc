#!/usr/bin/env node

import { parseArgs } from './cli/yargs.js';
import { executeDownload } from './cli/commands.js';

/**
 * メイン関数
 */
async function main(): Promise<void> {
  try {
    // コマンドライン引数の解析（yargsを使用）
    const options = parseArgs(process.argv);

    // ヘルプ表示の場合は自動的にyargsが処理するため、
    // ここではダウンロードコマンドを実行するのみ
    await executeDownload(options);

  } catch (error) {
    // エラー時の処理
    console.error(`❌ エラー: ${error}`);
    process.exit(1);
  }
}

// エントリポイント
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(`❌ 予期しないエラー: ${error}`);
    process.exit(1);
  });
