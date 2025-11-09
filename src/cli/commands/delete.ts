import type { Argv, CommandModule } from 'yargs';
import { profileExists, deleteProfile, listLocalProfiles } from '../../utils/profiles.js';
import { readLocalConfig, writeLocalConfig } from '../../utils/config.js';
import { askOverwrite } from '../../utils/fs.js';
import { DEFAULT_PROFILE } from '../../config.js';
import { EMOJI } from '../../emoji.js';

interface DeleteOptions {
  name: string;
  force?: boolean;
}

// プロファイル削除ロジック
async function removeProfile(options: DeleteOptions): Promise<void> {
  const { name, force } = options;

  // プロファイル存在チェック
  if (!(await profileExists(name))) {
    throw new Error(`${EMOJI.ERROR} プロファイル "${name}" が見つかりません`);
  }

  const config = await readLocalConfig();
  const isActive = config.current === name;

  // アクティブプロファイルの場合は確認
  if (isActive && !force) {
    const shouldDelete = await askOverwrite(
      `プロファイル "${name}" は現在アクティブです。削除しますか?`
    );
    if (!shouldDelete) {
      console.log(`${EMOJI.INFO} キャンセルされました`);
      return;
    }
  }

  console.log(`${EMOJI.DOWNLOAD} プロファイル "${name}" を削除中...`);

  // プロファイル削除
  await deleteProfile(name);

  // アクティブプロファイルだった場合は別のプロファイルに切り替え
  if (isActive) {
    const profiles = await listLocalProfiles();

    if (profiles.length === 0) {
      // プロファイルがなくなった場合はデフォルトに戻す
      config.current = DEFAULT_PROFILE;
      console.log(`${EMOJI.WARNING} プロファイルがなくなりました。"${DEFAULT_PROFILE}" に戻します`);
    } else {
      // 最初のプロファイルに切り替え
      config.current = profiles[0];
      console.log(`${EMOJI.INFO} アクティブプロファイルを "${profiles[0]}" に切り替えました`);
    }

    await writeLocalConfig(config);
  }

  console.log(`${EMOJI.SUCCESS} プロファイル "${name}" を削除しました`);
}

// yargs コマンドビルダー
const deleteCommandBuilder: CommandModule<{}, DeleteOptions> = {
  command: 'delete <name>',
  describe: 'プロファイルを削除',
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
        description: '確認なしで削除',
        default: false
      })
      .example('$0 delete myprofile', 'プロファイル "myprofile" を削除')
      .example('$0 delete myprofile --force', '確認なしで削除') as Argv<DeleteOptions>;
  },
  handler: async (argv) => {
    const options: DeleteOptions = {
      name: argv.name,
      force: argv.force
    };
    await removeProfile(options);
  }
};

export default deleteCommandBuilder;
