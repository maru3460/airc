import type { Argv, CommandModule } from 'yargs';
import { listRemoteProfiles } from './list.js';
import { downloadRemoteProfile } from './download.js';
import { handleOwner } from './owner.js';
import { handleName } from './name.js';
import { handleBranch } from './branch.js';

// オプション型定義
interface RemoteOptions {
  profile?: string;
  list?: boolean;
}

// メインハンドラ
async function handleRemote(options: RemoteOptions): Promise<void> {
  if (options.list) {
    await listRemoteProfiles();
    return;
  }

  if (options.profile) {
    await downloadRemoteProfile(options.profile);
  }
}

// yargs コマンドビルダー
const remoteCommandBuilder: CommandModule<{}, RemoteOptions> = {
  command: 'remote [profile]',
  describe: 'リモートプロファイルをダウンロード、またはリモート設定を管理',
  builder: (yargs: Argv) => {
    return yargs
      .positional('profile', {
        type: 'string',
        description: 'ダウンロードするプロファイル名'
      })
      .option('list', {
        alias: 'l',
        type: 'boolean',
        description: 'リモートプロファイル一覧を表示',
        default: false
      })
      // サブコマンド: owner
      .command(
        'owner [value]',
        'リポジトリオーナーを取得または設定',
        (yargs) => {
          return yargs.positional('value', {
            type: 'string',
            description: '設定するオーナー名'
          });
        },
        async (argv) => {
          await handleOwner(argv.value as string | undefined);
        }
      )
      // サブコマンド: name
      .command(
        'name [value]',
        'リポジトリ名を取得または設定',
        (yargs) => {
          return yargs.positional('value', {
            type: 'string',
            description: '設定するリポジトリ名'
          });
        },
        async (argv) => {
          await handleName(argv.value as string | undefined);
        }
      )
      // サブコマンド: branch
      .command(
        'branch [value]',
        'ブランチ名を取得または設定',
        (yargs) => {
          return yargs.positional('value', {
            type: 'string',
            description: '設定するブランチ名'
          });
        },
        async (argv) => {
          await handleBranch(argv.value as string | undefined);
        }
      )
      .example('$0 remote myprofile', '"myprofile" をダウンロード')
      .example('$0 remote --list', 'リモートプロファイル一覧を表示')
      .example('$0 remote owner', '現在のリポジトリオーナーを表示')
      .example('$0 remote owner maru3460', 'リポジトリオーナーを設定')
      .example('$0 remote name airc', 'リポジトリ名を設定')
      .example('$0 remote branch main', 'ブランチ名を設定') as Argv<RemoteOptions>;
  },
  handler: async (argv) => {
    const options: RemoteOptions = {
      profile: argv.profile,
      list: argv.list
    };
    await handleRemote(options);
  }
};

export default remoteCommandBuilder;
