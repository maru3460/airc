import { EMOJI } from '../../../emoji.js';
import { maskToken } from '../../../auth/github.js';
import { ensureInitialized, readLocalConfig, writeLocalConfig } from '../../../utils/config.js';

/**
 * repo.token を取得、設定、または削除
 * @param value - 設定する値（省略時は現在の値を表示）
 * @param options - オプション
 */
export async function handleToken(value?: string, options?: { remove?: boolean }): Promise<void> {
  await ensureInitialized();
  const config = await readLocalConfig();

  // 削除モード
  if (options?.remove) {
    if (!config.repo.token) {
      console.log(`${EMOJI.INFO} トークンは設定されていないのだ`);
      return;
    }
    delete config.repo.token;
    await writeLocalConfig(config);
    console.log(`${EMOJI.SUCCESS} トークンを削除したのだ`);
    return;
  }

  // 表示モード
  if (value === undefined) {
    if (!config.repo.token) {
      console.log(`${EMOJI.INFO} トークンは設定されていないのだ`);
      return;
    }
    const masked = maskToken(config.repo.token);
    console.log(masked);
    return;
  }

  // 設定モード
  config.repo.token = value;
  await writeLocalConfig(config);
  console.log(`${EMOJI.SUCCESS} トークンを設定したのだ`);
}
