import { getAvailableProfiles } from '../../../api/getAvailableProfiles.js';
import { EMOJI } from '../../../emoji.js';
import { ensureInitialized } from '../../../utils/config.js';
import { formatGitHubError } from '../../../messages.js';

/**
 * リモートプロファイル一覧を表示
 */
export async function listRemoteProfiles(): Promise<void> {
  await ensureInitialized();

  try {
    const profiles = await getAvailableProfiles();

    if (profiles.length === 0) {
      console.log(`${EMOJI.WARNING} リモートプロファイルが見つかりませんでした`);
      return;
    }

    console.log(`\n${EMOJI.SUCCESS} リモートプロファイル:\n`);

    profiles.forEach(profile => {
      console.log(`  - ${profile}`);
    });

    console.log(`\n使用例: airc remote ${profiles[0]}`);
  } catch (error: any) {
    throw formatGitHubError('リモートプロファイル一覧を取得できませんでした');
  }
}
