#!/usr/bin/env node

import { parseArgs } from './cli/yargs.js';
import downloadProfiles from './cli/commands/downloadProfiles.js';
import displayAvailableProfiles from './cli/commands/displayAvailableProfiles.js';
import { EMOJI } from './emoji.js';

// Ctrl+C のハンドリング
process.on('SIGINT', () => {
  console.log(`\n\n${EMOJI.WARNING}  ユーザーによって中断されました`);
  process.exit(130);
});

async function main(): Promise<void> {
  const options = parseArgs(process.argv);

  if (options.list) {
    await displayAvailableProfiles();
    return;
  }

  await downloadProfiles(options)
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    if (error.message) {
      console.error(`${EMOJI.ERROR} ${error.message}`);
    } else {
      console.error(`${EMOJI.ERROR} 予期しないエラー: ${error}`);
    }

    process.exit(1);
  });
