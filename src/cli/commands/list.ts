import type { Argv, CommandModule } from 'yargs';
import { listLocalProfiles } from '../../utils/profiles.js';
import { readLocalConfig } from '../../utils/config.js';
import { EMOJI } from '../../emoji.js';

// ローカルプロファイル一覧表示
async function listProfiles(): Promise<void> {
  console.log(`${EMOJI.SEARCH} ローカルプロファイル一覧を取得中...`);

  const profiles = await listLocalProfiles();

  if (profiles.length === 0) {
    console.log(`${EMOJI.WARNING} プロファイルが見つかりませんでした。`);
    console.log(`\n次のコマンドを実行してください:`);
    console.log(`  - airc init           # .airc/ を初期化`);
    console.log(`  - airc new <name>     # 新しいプロファイルを作成`);
    return;
  }

  const config = await readLocalConfig();
  const currentProfile = config.current;

  console.log(`\n${EMOJI.SUCCESS} ローカルプロファイル (${profiles.length} 件):\n`);

  profiles.forEach(profile => {
    if (profile === currentProfile) {
      console.log(`  - ${profile} ${EMOJI.INFO} (現在)`);
    } else {
      console.log(`  - ${profile}`);
    }
  });

  console.log(`\n使用例: airc use ${profiles[0]}`);
}

// yargs コマンドビルダー
const listCommandBuilder: CommandModule<{}, {}> = {
  command: 'list',
  describe: 'ローカルプロファイル一覧を表示',
  builder: (yargs: Argv) => {
    return yargs
      .example('$0 list', 'ローカルプロファイル一覧を表示') as Argv<{}>;
  },
  handler: async () => {
    await listProfiles();
  }
};

export default listCommandBuilder;
