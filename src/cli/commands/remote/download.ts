import { getProjectFiles } from '../../../api/getProjectFiles.js';
import { fetchManifest } from '../../../api/fetchManifest.js';
import { downloadFileContent } from '../../../api/downloadFileContent.js';
import { ensureDir, saveFile } from '../../../utils/fs.js';
import { isValidPath, toLocalPath } from '../../../utils/path.js';
import { MAX_FILE_SIZE } from '../../../config.js';
import { EMOJI } from '../../../emoji.js';
import { getProfilePath, profileExists, deleteProfile, isValidProfileName } from '../../../utils/profiles.js';
import { ensureInitialized } from '../../../utils/config.js';
import { PROFILE_NAME_REQUIRED_MESSAGE, getProfileAlreadyExistsRemoteMessage } from '../../../messages.js';

/**
 * ダウンロードの検証
 */
async function validateDownload(profile: string): Promise<void> {
  if (!profile) {
    throw new Error(PROFILE_NAME_REQUIRED_MESSAGE);
  }

  // プロファイル名のバリデーション
  if (!isValidProfileName(profile)) {
    throw new Error(`${EMOJI.ERROR} 不正なプロファイル名: ${profile}`);
  }

  // ローカルプロファイルの重複チェック
  if (await profileExists(profile)) {
    throw new Error(getProfileAlreadyExistsRemoteMessage(profile));
  }
}

/**
 * ファイルのダウンロード
 */
async function downloadFiles(profile: string): Promise<void> {
  const profilePath = getProfilePath(profile);

  // ファイル一覧を取得
  const manifest = await fetchManifest(profile);
  let files: string[];

  if (manifest) {
    files = manifest.files.map(file => `profiles/${profile}/${file}`);
  } else {
    files = await getProjectFiles(profile);
  }

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
      throw new Error(`${EMOJI.ERROR} 不正なパス: ${relativePath}`);
    }

    // プロファイルディレクトリ内のフルパス（.airc/profiles/{profile}/{relativePath}）
    const localPath = `${profilePath}/${relativePath}`;

    // ファイル内容ダウンロード
    const response = await downloadFileContent(filePath);

    // エラーチェック
    if (response.statusCode !== 200) {
      if (response.statusCode === 413) {
        throw new Error(
          `${EMOJI.ERROR} ファイルサイズ超過: ${relativePath} (上限: ${MAX_FILE_SIZE / 1024 / 1024}MB)`
        );
      }
      throw new Error(
        `${EMOJI.ERROR} ダウンロード失敗: ${relativePath} (${response.errorReason})`
      );
    }

    // 親ディレクトリの作成
    await ensureDir(localPath);

    // ファイルへの書き込み
    await saveFile(localPath, response.data!);
  }
}

/**
 * リモートプロファイルのダウンロード
 */
export async function downloadRemoteProfile(profile: string): Promise<void> {
  await ensureInitialized();

  await validateDownload(profile);

  console.log(`${EMOJI.DOWNLOAD} プロファイル "${profile}" をダウンロード中...`);

  try {
    await downloadFiles(profile);
  } catch (error) {
    // エラー発生時はダウンロード済みファイルを全削除
    await deleteProfile(profile);
    throw error;
  }

  console.log(`${EMOJI.SUCCESS} プロファイル "${profile}" をダウンロードしました`);
}
