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
    // エラーメッセージの表示（エラークラス側で詳細なメッセージを組み立て済み）
    if (error.message) {
      console.error(`❌ ${error.message}`);
    } else {
      console.error(`❌ 予期しないエラー: ${error}`);
    }

    // デバッグモード時はスタックトレースも表示
    if (process.env.DEBUG && error.stack) {
      console.error('\nスタックトレース:');
      console.error(error.stack);
    }

    process.exit(1);
  });
