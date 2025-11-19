import type { Argv, CommandModule } from 'yargs';
import { initLocalConfig, isInitialized, readLocalConfig, isConfigValid, repairConfig } from '../../utils/config.js';
import { initSyncFile, readSyncPatterns, isSyncFileValid } from '../../utils/syncPatterns.js';
import { createProfile } from '../../utils/profiles.js';
import { saveToProfile } from '../../utils/syncFiles.js';
import { DEFAULT_PROFILE } from '../../config.js';
import { EMOJI } from '../../emoji.js';

// オプション型定義
interface InitOptions {
  force?: boolean;
}

// 初期化ロジック
async function initializeAirc(options: InitOptions = {}): Promise<void> {
  const { force = false } = options;

  // 既に初期化済みか確認
  const initialized = await isInitialized();

  // --force オプション: 修復処理
  if (initialized && force) {
    // .sync の検証と修復
    if (await isSyncFileValid() === false) {
      await initSyncFile();
      console.log(`${EMOJI.WARNING} .sync を初期値で再作成しました`);
    } else {
      console.log(`.sync は正常です`);
    }

    // config.json の検証と修復
    try {
      const config = await readLocalConfig();
      if (await isConfigValid(config) === false) {
        throw new Error();
      }
      console.log(`config.json は正常です`);
    } catch (error) {
      const profileName = await repairConfig();
      console.log(`${EMOJI.WARNING} config.json を修復し、新しくプロファイル${profileName}を作成しました`);
    }

    console.log(`${EMOJI.SUCCESS} 修復処理が完了しました`);
    return;
  }

  // 通常の初期化
  if (initialized) {
    console.log(`${EMOJI.WARNING} 既に初期化済みです`);
    return;
  }

  await initLocalConfig();
  await initSyncFile();

  await createProfile(DEFAULT_PROFILE);

  const patterns = await readSyncPatterns();
  await saveToProfile(DEFAULT_PROFILE, patterns);

  console.log(`${EMOJI.SUCCESS} 初期化が完了しました`);
}

// yargs コマンドビルダー
const initCommandBuilder: CommandModule<{}, InitOptions> = {
  command: 'init',
  describe: '.airc/ ディレクトリを初期化',
  builder: (yargs: Argv) => {
    return yargs
      .option('force', {
        alias: 'f',
        type: 'boolean',
        description: '既存の設定を検証・修復（確認なし）',
        default: false,
      })
      .example('$0 init', '.airc/ を初期化')
      .example('$0 init --force', '既存の設定を検証・修復') as Argv<InitOptions>;
  },
  handler: async (argv) => {
    const options: InitOptions = {
      force: argv.force,
    };
    await initializeAirc(options);
  }
};

export default initCommandBuilder;
