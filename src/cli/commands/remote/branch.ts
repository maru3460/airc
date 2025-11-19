import { EMOJI } from '../../../emoji.js';
import { ensureInitialized, readLocalConfig, writeLocalConfig } from '../../../utils/config.js';

/**
 * repo.branch を取得または設定
 * @param value - 設定する値（省略時は現在の値を表示）
 */
export async function handleBranch(value?: string): Promise<void> {
  await ensureInitialized();
  const config = await readLocalConfig();

  if (value === undefined) {
    // 表示モード
    console.log(config.repo.branch);
    return;
  }

  // 設定モード
  config.repo.branch = value;
  await writeLocalConfig(config);
  console.log(`${EMOJI.SUCCESS} repo.branch を "${value}" に設定したのだ`);
}
