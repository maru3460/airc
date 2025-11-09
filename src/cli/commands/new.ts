import type { Argv, CommandModule } from 'yargs';
import { createProfile, profileExists, isValidProfileName } from '../../utils/profiles.js';
import { EMOJI } from '../../emoji.js';

interface NewOptions {
  name: string;
}

// 新規プロファイル作成ロジック
async function createNewProfile(options: NewOptions): Promise<void> {
  const { name } = options;

  // プロファイル名のバリデーション
  if (!isValidProfileName(name)) {
    throw new Error(`${EMOJI.ERROR} 不正なプロファイル名: ${name}`);
  }

  // 既存チェック
  if (await profileExists(name)) {
    throw new Error(`${EMOJI.ERROR} プロファイル "${name}" は既に存在します`);
  }

  console.log(`${EMOJI.DOWNLOAD} プロファイル "${name}" を作成中...`);

  // プロファイル作成
  await createProfile(name);

  console.log(`${EMOJI.SUCCESS} プロファイル "${name}" を作成しました`);
  console.log(`\n次のステップ:`);
  console.log(`  - airc use ${name}    # このプロファイルに切り替え`);
  console.log(`  - airc list           # プロファイル一覧を表示`);
}

// yargs コマンドビルダー
const newCommandBuilder: CommandModule<{}, NewOptions> = {
  command: 'new <name>',
  describe: '新しいプロファイルを作成',
  builder: (yargs: Argv) => {
    return yargs
      .positional('name', {
        type: 'string',
        description: 'プロファイル名',
        demandOption: true
      })
      .example('$0 new myprofile', '新しいプロファイル "myprofile" を作成') as Argv<NewOptions>;
  },
  handler: async (argv) => {
    const options: NewOptions = {
      name: argv.name
    };
    await createNewProfile(options);
  }
};

export default newCommandBuilder;
