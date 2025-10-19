#!/usr/bin/env node

import { parseArgs } from './cli/yargs.js';
import { executeDownload, executeList } from './cli/commands.js';

/**
 * Ctrl+C (SIGINT) のハンドリング
 */
process.on('SIGINT', () => {
  console.log('\n\n⚠️  ユーザーによって中断されました');
  process.exit(130); // SIGINT の標準的な終了コード
});

/**
 * メイン関数
 */
async function main(): Promise<void> {
  // コマンドライン引数の解析（yargsを使用）
  const options = parseArgs(process.argv);

  // --list オプションが指定された場合はプロファイル一覧を表示
  if (options.list) {
    await executeList();
  } else {
    // それ以外の場合はダウンロードコマンドを実行
    await executeDownload(options);
  }
}

// エントリポイント
main()
  .then(() => {
    // 正常終了
    process.exit(0);
  })
  .catch((error) => {
    // エラーメッセージの表示（絵文字を統一的に付与）
    if (error.message) {
      console.error(`❌ エラー: ${error.message}`);
    } else {
      console.error(`❌ 予期しないエラー: ${error}`);
    }

    // デバッグモード時はスタックトレースも表示
    if (process.env.DEBUG) {
      console.error('\nスタックトレース:');
      console.error(error.stack);
    }

    process.exit(1);
  });
