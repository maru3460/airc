import type { Argv, CommandModule } from 'yargs';
import { getAvailableProfiles } from '../../api/getAvailableProfiles.js';
import { DEFAULT_PROJECT } from '../../config.js';
import { EMOJI } from '../../emoji.js';
import type { ListOptions } from '../../types.js';

// プロファイル一覧表示
async function listProfiles(): Promise<void> {
  console.log(`利用可能なプロファイル一覧を取得中...`);

  const profiles = await getAvailableProfiles();

  if (profiles.length === 0) {
    console.log(`${EMOJI.WARNING} 利用可能なプロファイルが見つかりませんでした。`);
    return;
  }

  console.log(`\n利用可能なプロファイル (${profiles.length} 件):\n`);

  profiles.forEach(profile => {
    if (profile === DEFAULT_PROJECT) {
      console.log(`  - ${profile} (デフォルト)`);
    } else {
      console.log(`  - ${profile}`);
    }
  });

  console.log(`\n使用例: airc sync -p ${profiles[0]}`);
}

// yargs コマンドビルダー
const listCommandBuilder: CommandModule<{}, ListOptions> = {
  command: 'list',
  describe: '利用可能なプロファイル一覧を表示',
  builder: (yargs: Argv) => {
    return yargs
      .example('$0 list', 'プロファイル一覧を表示') as Argv<ListOptions>;
  },
  handler: async () => {
    await listProfiles();
  }
};

export default listCommandBuilder;
