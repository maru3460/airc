import type { Argv, CommandModule } from 'yargs';
import { initLocalConfig, isInitialized } from '../../utils/config.js';
import { initSyncFile, readSyncPatterns } from '../../utils/syncPatterns.js';
import { createProfile } from '../../utils/profiles.js';
import { saveToProfile } from '../../utils/syncFiles.js';
import { DEFAULT_PROFILE } from '../../config.js';
import { EMOJI } from '../../emoji.js';

// 初期化ロジック
async function initializeAirc(): Promise<void> {
  // 既に初期化済みか確認
  const initialized = await isInitialized();
  if (initialized) {
    console.log(`${EMOJI.WARNING} .airc/ は既に初期化済みです`);
    return;
  }

  console.log(`${EMOJI.DOWNLOAD} .airc/ を初期化中...`);

  // 設定ファイルの初期化
  await initLocalConfig();
  console.log(`${EMOJI.SUCCESS} 設定ファイルを作成しました`);

  // .sync ファイルの初期化
  await initSyncFile();
  console.log(`${EMOJI.SUCCESS} .sync ファイルを作成しました`);

  // デフォルトプロファイルの作成
  await createProfile(DEFAULT_PROFILE);
  console.log(`${EMOJI.SUCCESS} デフォルトプロファイル "${DEFAULT_PROFILE}" を作成しました`);

  // 既存の実ファイルをmainプロファイルに保存
  console.log(`${EMOJI.DOWNLOAD} 既存のファイルをプロファイル "${DEFAULT_PROFILE}" に保存中...`);
  const patterns = await readSyncPatterns();
  await saveToProfile(DEFAULT_PROFILE, patterns, { force: true });
  console.log(`${EMOJI.SUCCESS} 既存のファイルを保存しました`);

  console.log(`\n${EMOJI.SUCCESS} 初期化完了！`);
  console.log(`\n次のステップ:`);
  console.log(`  - airc list           # プロファイル一覧を表示`);
  console.log(`  - airc new <name>     # 新しいプロファイルを作成`);
  console.log(`  - airc sync <profile> # リモートプロファイルをダウンロード`);
}

// yargs コマンドビルダー
const initCommandBuilder: CommandModule<{}, {}> = {
  command: 'init',
  describe: '.airc/ ディレクトリを初期化',
  builder: (yargs: Argv) => {
    return yargs
      .example('$0 init', '.airc/ を初期化') as Argv<{}>;
  },
  handler: async () => {
    await initializeAirc();
  }
};

export default initCommandBuilder;
