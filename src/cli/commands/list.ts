import type { Argv, CommandModule } from 'yargs';
import { listLocalProfiles } from '../../utils/profiles.js';
import { readLocalConfig, ensureInitialized } from '../../utils/config.js';
import { EMOJI, colorString } from '../../emoji.js';

// ローカルプロファイル一覧表示
async function listProfiles(): Promise<void> {
  await ensureInitialized();

  const profiles = await listLocalProfiles();

  const config = await readLocalConfig();
  const currentProfile = config.current;

  console.log(`ローカルプロファイル:\n`);

  profiles.forEach(profile => {
    if (profile === currentProfile) {
      console.log(`  ${colorString(`- ${profile}`)}`);
    } else {
      console.log(`  - ${profile}`);
    }
  });
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
