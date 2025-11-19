import type { Argv, CommandModule } from 'yargs';
import { profileExists, deleteProfile } from '../../utils/profiles.js';
import { readLocalConfig, ensureInitialized } from '../../utils/config.js';
import { EMOJI } from '../../emoji.js';

interface DeleteOptions {
  name: string;
}

// プロファイル削除ロジック
async function removeProfile(options: DeleteOptions): Promise<void> {
  await ensureInitialized();

  const { name } = options;

  // プロファイル存在チェック
  if (!(await profileExists(name))) {
    throw new Error(`${EMOJI.ERROR} プロファイル "${name}" が見つかりません`);
  }

  const config = await readLocalConfig();
  const isActive = config.current === name;

  // アクティブプロファイルの場合は削除禁止
  if (isActive) {
    throw new Error(`${EMOJI.ERROR} アクティブプロファイル "${name}" は削除できません。先に別のプロファイルに切り替えてください`);
  }

  console.log(`プロファイル "${name}" を削除中...`);

  // プロファイル削除
  await deleteProfile(name);

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
      .example('$0 delete myprofile', 'プロファイル "myprofile" を削除') as Argv<DeleteOptions>;
  },
  handler: async (argv) => {
    const options: DeleteOptions = {
      name: argv.name
    };
    await removeProfile(options);
  }
};

export default deleteCommandBuilder;
