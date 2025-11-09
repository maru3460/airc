import type { Argv, CommandModule } from 'yargs';
import { profileExists } from '../../utils/profiles.js';
import { readLocalConfig, writeLocalConfig } from '../../utils/config.js';
import { saveToProfile, restoreFromProfile } from '../../utils/syncFiles.js';
import { readSyncPatterns } from '../../utils/syncPatterns.js';
import { EMOJI } from '../../emoji.js';

interface UseOptions {
  name: string;
  force?: boolean;
}

// プロファイル切り替えロジック
async function switchProfile(options: UseOptions): Promise<void> {
  const { name, force } = options;

  // プロファイル存在チェック
  if (!(await profileExists(name))) {
    throw new Error(`${EMOJI.ERROR} プロファイル "${name}" が見つかりません`);
  }

  const config = await readLocalConfig();
  const currentProfile = config.current;

  // 既に同じプロファイルの場合
  if (currentProfile === name) {
    console.log(`${EMOJI.INFO} 既にプロファイル "${name}" を使用中です`);
    return;
  }

  console.log(`${EMOJI.SYNC} プロファイルを "${currentProfile}" から "${name}" に切り替え中...`);

  // .sync パターンを読み込み
  const patterns = await readSyncPatterns();

  // 1. 現在のプロファイルに実ファイルを保存
  console.log(`${EMOJI.DOWNLOAD} 現在のファイルをプロファイル "${currentProfile}" に保存中...`);
  await saveToProfile(currentProfile, patterns, { force: true });

  // 2. 設定を更新
  config.current = name;
  await writeLocalConfig(config);

  // 3. 新しいプロファイルから実ファイルに展開
  console.log(`${EMOJI.DOWNLOAD} プロファイル "${name}" からファイルを展開中...`);
  await restoreFromProfile(name, { force: force || false });

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
      .option('force', {
        alias: 'f',
        type: 'boolean',
        description: '既存ファイルを強制上書き',
        default: false
      })
      .example('$0 use myprofile', 'プロファイルを "myprofile" に切り替え')
      .example('$0 use myprofile --force', '強制上書きで切り替え') as Argv<UseOptions>;
  },
  handler: async (argv) => {
    const options: UseOptions = {
      name: argv.name,
      force: argv.force
    };
    await switchProfile(options);
  }
};

export default useCommandBuilder;
