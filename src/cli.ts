#!/usr/bin/env node

import { createYargsInstance } from './cli/yargs.js';
import { EMOJI } from './emoji.js';

// Ctrl+C のハンドリング
process.on('SIGINT', () => {
  console.log(`\n\n${EMOJI.WARNING}  ユーザーによって中断されました`);
  process.exit(130);
});

// エラーハンドリングのラッパー
process.on('unhandledRejection', (error: any) => {
  if (error?.message) {
    console.error(`${EMOJI.ERROR} ${error.message}`);
  } else {
    console.error(`${EMOJI.ERROR} 予期しないエラー: ${error}`);
  }
  process.exit(1);
});

// yargsインスタンスを作成（サブコマンドハンドラが自動実行される）
createYargsInstance(process.argv);
