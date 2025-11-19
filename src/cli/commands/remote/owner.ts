import { EMOJI } from '../../../emoji.js';
import { ensureInitialized, readLocalConfig, writeLocalConfig } from '../../../utils/config.js';

/**
 * repo.owner を取得または設定
 * @param value - 設定する値（省略時は現在の値を表示）
 */
export async function handleOwner(value?: string): Promise<void> {
  await ensureInitialized();
  const config = await readLocalConfig();

  if (value === undefined) {
    // 表示モード
    console.log(config.repo.owner);
    return;
  }

  // 設定モード
  config.repo.owner = value;
  await writeLocalConfig(config);
  console.log(`${EMOJI.SUCCESS} repo.owner を "${value}" に設定したのだ`);
}
