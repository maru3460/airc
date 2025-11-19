import type { Argv, CommandModule } from 'yargs';
import { restoreFromProfile } from '../../utils/syncFiles.js';
import { profileExists } from '../../utils/profiles.js';
import { ensureInitialized } from '../../utils/config.js';
import { askOverwrite } from '../../utils/fs.js';
import { EMOJI } from '../../emoji.js';

interface RestoreOptions {
  profile: string;
  force?: boolean;
}

/**
 * プロファイルから実ファイルへの復元ロジック
 * 注意: アクティブプロファイルは変更されず、現在の作業内容も保存されない
 * @param options - 復元オプション
 */
async function restoreProfile(options: RestoreOptions): Promise<void> {
  await ensureInitialized();

  const { force } = options;

  const profileName = options.profile;

  // プロファイルの存在確認
  if (!(await profileExists(profileName))) {
    throw new Error(`${EMOJI.ERROR} プロファイル "${profileName}" が見つかりません`);
  }

  // 確認プロンプト（--forceがない場合）
  if (!force) {
    console.log(`\n${EMOJI.WARNING} 注意:`);
    console.log(`  - プロファイル "${profileName}" の内容を展開します`);
    console.log(`  - 現在の作業内容はプロファイルに保存されません\n`);

    const shouldRestore = await askOverwrite('続けますか?');

    if (!shouldRestore) {
      console.log(`${EMOJI.INFO} キャンセルされました`);
      return;
    }
  }

  // プロファイルから実ファイルへ展開
  await restoreFromProfile(profileName);

  console.log(`${EMOJI.SUCCESS} プロファイル "${profileName}" を実ファイルに展開しました`);
}

// yargs コマンドビルダー
const restoreCommandBuilder: CommandModule<{}, RestoreOptions> = {
  command: 'restore <profile>',
  describe: 'プロファイルから実ファイルに復元',
  builder: (yargs: Argv) => {
    return yargs
      .positional('profile', {
        type: 'string',
        description: '復元するプロファイル名',
        demandOption: true
      })
      .option('force', {
        alias: 'f',
        type: 'boolean',
        description: '確認なしで復元',
        default: false
      })
      .example('$0 restore myprofile', '指定したプロファイルを復元')
      .example('$0 restore myprofile --force', '確認なしで復元') as Argv<RestoreOptions>;
  },
  handler: async (argv) => {
    const options: RestoreOptions = {
      profile: argv.profile,
      force: argv.force
    };
    await restoreProfile(options);
  }
};

export default restoreCommandBuilder;
