import { EMOJI } from '../../../emoji.js';
import { ensureInitialized, readLocalConfig, writeLocalConfig } from '../../../utils/config.js';

/**
 * repo.name を取得または設定
 * @param value - 設定する値（省略時は現在の値を表示）
 */
export async function handleName(value?: string): Promise<void> {
  await ensureInitialized();
  const config = await readLocalConfig();

  if (value === undefined) {
    // 表示モード
    console.log(config.repo.name);
    return;
  }

  // 設定モード
  config.repo.name = value;
  await writeLocalConfig(config);
  console.log(`${EMOJI.SUCCESS} repo.name を "${value}" に設定したのだ`);
}
