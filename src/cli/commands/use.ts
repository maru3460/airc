import type { Argv, CommandModule } from 'yargs';
import { profileExists } from '../../utils/profiles.js';
import { readLocalConfig, writeLocalConfig, ensureInitialized } from '../../utils/config.js';
import { saveToProfile, restoreFromProfile, clearFiles } from '../../utils/syncFiles.js';
import { readSyncPatterns } from '../../utils/syncPatterns.js';
import { EMOJI } from '../../emoji.js';

interface UseOptions {
  name: string;
}

// プロファイル切り替えロジック
async function switchProfile(options: UseOptions): Promise<void> {
  await ensureInitialized();

  const { name } = options;

  const config = await readLocalConfig();
  const currentProfile = config.current;

  if (currentProfile === name) {
    console.log(`${EMOJI.INFO} 既にプロファイル "${name}" を使用中です`);
    return;
  }

  const patterns = await readSyncPatterns();

  await saveToProfile(currentProfile, patterns);

  await clearFiles(patterns);

  config.current = name;
  await writeLocalConfig(config);

  await restoreFromProfile(name);

  console.log(`${EMOJI.SUCCESS} プロファイルを "${name}" に切り替えました`);
}

// yargs コマンドビルダー
const useCommandBuilder: CommandModule<{}, UseOptions> = {
  command: 'use <name>',
  describe: 'アクティブプロファイルを切り替え',
  builder: (yargs: Argv) => {
    return yargs
      .positional('name', {
        type: 'string',
        description: 'プロファイル名',
        demandOption: true
      })
      .example('$0 use myprofile', 'プロファイルを "myprofile" に切り替え') as Argv<UseOptions>;
  },
  handler: async (argv) => {
    const options: UseOptions = {
      name: argv.name
    };
    await switchProfile(options);
  }
};

export default useCommandBuilder;
