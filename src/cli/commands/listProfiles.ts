import { getAvailableProfiles } from '../../api/getAvailableProfiles.js';
import { DEFAULT_PROJECT } from '../../config.js';
import { EMOJI } from '../../emoji.js';

// プロファイル一覧表示
export default async function listProfiles(): Promise<void> {
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

  console.log(`\n使用例: airc -p ${profiles[0]}`);
}
