import { access, mkdir, writeFile, chmod, rename } from 'fs/promises';
import { dirname } from 'path';
import readline from 'readline';
import { EMOJI } from '../emoji.js';

/**
 * ファイルが存在するかチェックする
 *
 * @param filePath チェック対象のパス
 * @returns ファイルが存在する場合は true、存在しない場合は false
 * @throws Error ENOENT 以外のエラー（権限エラーなど）が発生した場合
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch (error: any) {
    // ファイルが存在しない場合は false を返す
    if (error.code === 'ENOENT') {
      return false;
    }

    // その他のエラー（権限エラーなど）はスローする
    throw new Error(`ファイル操作エラー (access): ${filePath} (${error.code}: ${error.message})`);
  }
}

/**
 * ファイル上書き確認をユーザーに問い合わせる
 */
export async function askOverwrite(filename: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`ファイル ${filename} は既に存在します。上書きしますか? (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

/**
 * 汎用的な確認をユーザーに問い合わせる
 */
export async function askConfirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

/**
 * 親ディレクトリを再帰的に作成する
 *
 * @param filePath ファイルパス（親ディレクトリを作成する）
 * @throws Error ディレクトリ作成に失敗した場合（権限エラーなど）
 */
export async function ensureDir(filePath: string): Promise<void> {
  const dir = dirname(filePath);

  try {
    // ディレクトリを再帰的に作成（パーミッション 0o755）
    await mkdir(dir, { recursive: true, mode: 0o755 });
  } catch (error: any) {
    // EEXIST エラーは既存ディレクトリなので無視（recursive: true で基本的に発生しないが念のため）
    if (error.code === 'EEXIST') {
      return;
    }

    // EACCES エラー（権限なし）
    if (error.code === 'EACCES') {
      throw new Error(`ファイル操作エラー (mkdir): ${dir} (EACCES: 権限がありません)`);
    }

    // その他のエラー
    throw new Error(`ファイル操作エラー (mkdir): ${dir} (${error.code}: ${error.message})`);
  }
}

/**
 * ファイルに内容を書き込む
 *
 * @param filePath 書き込み先のパス
 * @param content 書き込む内容
 */
export async function saveFile(filePath: string, content: string): Promise<void> {
  // ファイルを書き込む
  await writeFile(filePath, content, 'utf-8');

  // パーミッションを設定（通常ファイル: 0o644）
  try {
    await chmod(filePath, 0o644);
  } catch (error: any) {
    // Windows などでパーミッション設定がサポートされていない場合は無視
    if (error.code !== 'ENOTSUP' && error.code !== 'EPERM') {
      // 重大なエラーではないので警告のみ
      console.warn(`${EMOJI.WARNING} パーミッション設定に失敗しました: ${filePath}`);
    }
  }
}

/**
 * ファイルを別のディレクトリに移動する
 *
 * @param sourcePath 移動元のパス
 * @param targetPath 移動先のパス
 * @throws Error ファイル移動に失敗した場合
 */
export async function moveFile(sourcePath: string, targetPath: string): Promise<void> {
  try {
    // 移動先のディレクトリを作成
    await ensureDir(targetPath);

    // ファイルを移動
    await rename(sourcePath, targetPath);
  } catch (error: any) {
    throw new Error(`ファイル移動エラー: ${sourcePath} -> ${targetPath} (${error.code}: ${error.message})`);
  }
}
