import type { Argv, CommandModule } from 'yargs';
import { profileExists, isValidProfileName, getProfilePath } from '../../utils/profiles.js';
import { readLocalConfig, writeLocalConfig, ensureInitialized } from '../../utils/config.js';
import { EMOJI } from '../../emoji.js';
import { promises as fs } from 'fs';

interface RenameOptions {
  oldname: string;
  newname: string;
}

// プロファイルリネームロジック
async function renameProfile(options: RenameOptions): Promise<void> {
  await ensureInitialized();

  const { oldname, newname } = options;

  if (!isValidProfileName(newname)) {
    throw new Error(`${EMOJI.ERROR} 不正なプロファイル名: ${newname}`);
  }

  if (await profileExists(newname)) {
    throw new Error(`${EMOJI.ERROR} プロファイル "${newname}" は既に存在します`);
  }

  // ディレクトリをリネーム
  const oldPath = getProfilePath(oldname);
  const newPath = getProfilePath(newname);
  await fs.rename(oldPath, newPath);

  // アクティブプロファイルが変更対象の場合は設定を更新
  const config = await readLocalConfig();
  if (config.current === oldname) {
    config.current = newname;
    await writeLocalConfig(config);
  }

  console.log(`${EMOJI.SUCCESS} プロファイルを "${oldname}" から "${newname}" にリネームしました`);
}

// yargs コマンドビルダー
const renameCommandBuilder: CommandModule<{}, RenameOptions> = {
  command: 'rename <oldname> <newname>',
  describe: 'プロファイルをリネーム',
  builder: (yargs: Argv) => {
    return yargs
      .positional('oldname', {
        type: 'string',
        description: '現在のプロファイル名',
        demandOption: true
      })
      .positional('newname', {
        type: 'string',
        description: '新しいプロファイル名',
        demandOption: true
      })
      .example('$0 rename old new', 'プロファイル "old" を "new" にリネーム') as Argv<RenameOptions>;
  },
  handler: async (argv) => {
    const options: RenameOptions = {
      oldname: argv.oldname,
      newname: argv.newname
    };
    await renameProfile(options);
  }
};

export default renameCommandBuilder;
