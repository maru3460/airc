import { getProjectFiles } from '../../api/getProjectFiles.js';
import { fetchManifest } from '../../api/fetchManifest.js';
import { downloadFileContent } from '../../api/downloadFileContent.js';
import { fileExists, askOverwrite, ensureDir, saveFile } from '../../utils/fs.js';
import { isValidPath, toLocalPath } from '../../utils/path.js';
import { MAX_FILE_SIZE } from '../../config.js';
import type { CliOptions, DownloadErrors } from '../../types.js';
import { EMOJI } from '../../emoji.js';

// プロファイルの同期（手続き的処理）
export default async function syncProfiles(options: CliOptions): Promise<void> {
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

  // 各ファイルをダウンロード
  for (const filePath of files) {
    // ローカルパスの生成
    const localPath = toLocalPath(filePath, profile);

    // README.md は除外
    if (localPath.endsWith('README.md')) {
      continue;
    }

    // パスバリデーション（セキュリティチェック）
    if (!isValidPath(localPath)) {
      const errorMsg = `不正なパスが検出されました: ${localPath}`;
      console.log(`${EMOJI.ERROR} ${errorMsg}`);
      errors.push({
        file: filePath.replace(`profiles/${profile}/`, ''),
        reason: errorMsg
      });
      continue;
    }

    // ファイル内容ダウンロード（宣言的な道具を呼び出す）
    const response = await downloadFileContent(filePath);

    // エラーチェック
    if (response.statusCode !== 200) {
      if (response.statusCode === 413) {
        // ファイルサイズ超過
        console.log(
          `${EMOJI.ERROR} ファイルサイズ超過 ${localPath}: ${response.errorReason} (上限: ${MAX_FILE_SIZE / 1024 / 1024}MB)`
        );
      } else {
        // その他のエラー
        console.log(`${EMOJI.ERROR} ダウンロード失敗 ${localPath}: ${response.errorReason}`);
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
      console.log(`${EMOJI.ERROR} 書き込み失敗 ${localPath}: ${error}`);
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
    console.log(`${EMOJI.SUCCESS} 完了しました！`);
  }
}
