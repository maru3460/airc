import { getProjectFiles, fetchManifest } from '../../github/api.js';
import { downloadFile } from '../../github/download.js';
import type { CliOptions, DownloadErrors } from '../../types.js';
import { EMOJI } from '../../emoji.js';

// プロファイルのダウンロード
export default async function downloadProfiles(options: CliOptions): Promise<void> {
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
  for (const file of files) {
    const result = await downloadFile(file, profile, force);

    if (result.status === 'error') {
      errors.push({
        file: file.replace(`profiles/${profile}/`, ''),
        reason: result.reason
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
