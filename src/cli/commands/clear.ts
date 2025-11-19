import type { Argv, CommandModule } from 'yargs';
import { clearFiles } from '../../utils/syncFiles.js';
import { readSyncPatterns, matchFiles } from '../../utils/syncPatterns.js';
import { ensureInitialized } from '../../utils/config.js';
import { askConfirm } from '../../utils/fs.js';
import { EMOJI } from '../../emoji.js';

interface ClearOptions {
  force?: boolean;
}

// ファイル削除ロジック
async function clearSyncedFiles(options: ClearOptions): Promise<void> {
  await ensureInitialized();

  const { force } = options;

  const patterns = await readSyncPatterns();
  const files = await matchFiles(patterns);

  if (files.length === 0) {
    console.log(`${EMOJI.INFO} 削除対象のファイルが見つかりませんでした`);
    return;
  }

  // 確認なしでない場合はユーザーに確認
  if (!force) {
    const shouldDelete = await askConfirm(
      '.sync に従ってファイルをクリアします。よろしいですか?'
    );

    if (!shouldDelete) {
      console.log(`${EMOJI.INFO} キャンセルされました`);
      return;
    }
  }

  // ファイル削除
  await clearFiles(patterns);

  console.log(`${EMOJI.SUCCESS} ${files.length} 個のファイルを削除しました`);
}

// yargs コマンドビルダー
const clearCommandBuilder: CommandModule<{}, ClearOptions> = {
  command: 'clear',
  describe: '.sync パターンに一致する実ファイルを削除',
  builder: (yargs: Argv) => {
    return yargs
      .option('force', {
        alias: 'f',
        type: 'boolean',
        description: '確認なしで削除',
        default: false
      })
      .example('$0 clear', '同期ファイルを削除')
      .example('$0 clear --force', '確認なしで削除') as Argv<ClearOptions>;
  },
  handler: async (argv) => {
    const options: ClearOptions = {
      force: argv.force
    };
    await clearSyncedFiles(options);
  }
};

export default clearCommandBuilder;
