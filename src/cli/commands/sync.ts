import type { Argv, CommandModule } from 'yargs';
import { getProjectFiles } from '../../api/getProjectFiles.js';
import { fetchManifest } from '../../api/fetchManifest.js';
import { downloadFileContent } from '../../api/downloadFileContent.js';
import { fileExists, askOverwrite, ensureDir, saveFile } from '../../utils/fs.js';
import { isValidPath, toLocalPath } from '../../utils/path.js';
import { MAX_FILE_SIZE, DEFAULT_PROJECT } from '../../config.js';
import type { SyncOptions, DownloadErrors } from '../../types.js';
import { EMOJI } from '../../emoji.js';
import { getAvailableProfiles } from '../../api/getAvailableProfiles.js';
import { getProfilePath } from '../../utils/profiles.js';
import { readLocalConfig, writeLocalConfig } from '../../utils/config.js';
import { restoreFromProfile } from '../../utils/syncFiles.js';

// リモートプロファイル一覧表示
async function listRemoteProfiles(): Promise<void> {
  console.log(`${EMOJI.SEARCH} リモートプロファイル一覧を取得中...`);

  const profiles = await getAvailableProfiles();

  if (profiles.length === 0) {
    console.log(`${EMOJI.WARNING} リモートプロファイルが見つかりませんでした。`);
    return;
  }

  console.log(`\n${EMOJI.SUCCESS} リモートプロファイル (${profiles.length} 件):\n`);

  profiles.forEach(profile => {
    if (profile === DEFAULT_PROJECT) {
      console.log(`  - ${profile} (デフォルト)`);
    } else {
      console.log(`  - ${profile}`);
    }
  });

  console.log(`\n使用例: airc sync ${profiles[0]}`);
}

// プロファイルの同期（手続き的処理）
async function syncProfile(options: SyncOptions): Promise<void> {
  const { profile, force } = options;

  console.log(`${EMOJI.DOWNLOAD} プロファイル「${profile}」の設定をダウンロード中...`);

  const manifest = await fetchManifest(profile);

  let files: string[];

  if (manifest) {
    console.log(`マニフェストファイルを使用します (${manifest.files.length} ファイル)`);
    files = manifest.files.map(file => `profiles/${profile}/${file}`);
  } else {
    console.log(`${EMOJI.SEARCH} GitHub API で再帰的にファイルを取得中...`);
    files = await getProjectFiles(profile);
  }

  const errors: DownloadErrors = [];

  // プロファイルディレクトリのパスを取得（.airc/profiles/{profile}/）
  const profilePath = getProfilePath(profile);

  // 各ファイルをダウンロード
  for (const filePath of files) {
    // ローカルパスの生成（profiles/{profile}/ プレフィックスを除去）
    const relativePath = toLocalPath(filePath, profile);

    // README.md は除外
    if (relativePath.endsWith('README.md')) {
      continue;
    }

    // パスバリデーション（セキュリティチェック）
    if (!isValidPath(relativePath)) {
      const errorMsg = `不正なパスが検出されました: ${relativePath}`;
      console.log(`${EMOJI.ERROR} ${errorMsg}`);
      errors.push({
        file: filePath.replace(`profiles/${profile}/`, ''),
        reason: errorMsg
      });
      continue;
    }

    // プロファイルディレクトリ内のフルパス（.airc/profiles/{profile}/{relativePath}）
    const localPath = `${profilePath}/${relativePath}`;

    // ファイル内容ダウンロード（宣言的な道具を呼び出す）
    const response = await downloadFileContent(filePath);

    // エラーチェック
    if (response.statusCode !== 200) {
      if (response.statusCode === 413) {
        // ファイルサイズ超過
        console.log(
          `${EMOJI.ERROR} ファイルサイズ超過 ${relativePath}: ${response.errorReason} (上限: ${MAX_FILE_SIZE / 1024 / 1024}MB)`
        );
      } else {
        // その他のエラー
        console.log(`${EMOJI.ERROR} ダウンロード失敗 ${relativePath}: ${response.errorReason}`);
      }
      errors.push({
        file: filePath.replace(`profiles/${profile}/`, ''),
        reason: response.errorReason || 'Unknown error'
      });
      continue;
    }

    // ファイル存在チェック
    const exists = await fileExists(localPath);

    // 既存ファイルの上書き確認処理
    if (exists && !force) {
      const shouldOverwrite = await askOverwrite(localPath);
      if (!shouldOverwrite) {
        continue; // スキップ
      }
    }

    // 親ディレクトリの作成
    await ensureDir(localPath);

    // ファイルへの書き込み
    try {
      await saveFile(localPath, response.data!);
    } catch (error) {
      console.log(`${EMOJI.ERROR} 書き込み失敗 ${relativePath}: ${error}`);
      errors.push({
        file: filePath.replace(`profiles/${profile}/`, ''),
        reason: `書き込み失敗: ${error}`
      });
    }
  }

  // エラーがあれば表示
  if (errors.length > 0) {
    console.log(`\n${EMOJI.WARNING}  ${errors.length} 件のファイルのダウンロードに失敗しました:`);
    errors.forEach(({ file, reason }) => {
      console.log(`  - ${file} (${reason})`);
    });
  } else {
    console.log(`${EMOJI.SUCCESS} プロファイル「${profile}」を .airc/profiles/${profile}/ にダウンロードしました！`);
  }

  // ダウンロード成功後、アクティブプロファイルに設定
  if (errors.length === 0) {
    console.log(`${EMOJI.SYNC} プロファイル「${profile}」をアクティブに設定中...`);
    const config = await readLocalConfig();
    config.current = profile;
    await writeLocalConfig(config);

    // 実ファイルへ展開
    console.log(`${EMOJI.SYNC} 実ファイルへ展開中...`);
    await restoreFromProfile(profile, { force });
  }
}

// yargs コマンドビルダー
const syncCommandBuilder: CommandModule<{}, SyncOptions> = {
  command: 'sync [profile]',
  describe: 'プロファイルの設定ファイルをダウンロード',
  builder: (yargs: Argv) => {
    return yargs
      .positional('profile', {
        type: 'string',
        description: 'プロファイル名を指定',
        default: DEFAULT_PROJECT
      })
      .option('force', {
        alias: 'f',
        type: 'boolean',
        description: '既存ファイルを強制上書き',
        default: false
      })
      .option('list', {
        alias: 'l',
        type: 'boolean',
        description: 'リモートプロファイル一覧を表示',
        default: false
      })
      .example('$0 sync', 'デフォルトプロファイルをダウンロード')
      .example('$0 sync myprofile', '"myprofile" をダウンロード')
      .example('$0 sync --force', '既存ファイルを強制上書き')
      .example('$0 sync --list', 'リモートプロファイル一覧を表示') as Argv<SyncOptions>;
  },
  handler: async (argv) => {
    // --list オプションが指定された場合はプロファイル一覧を表示
    if (argv.list) {
      await listRemoteProfiles();
      return;
    }

    // 通常の同期処理
    const options: SyncOptions = {
      profile: argv.profile,
      force: argv.force,
      list: argv.list
    };
    await syncProfile(options);
  }
};

export default syncCommandBuilder;
