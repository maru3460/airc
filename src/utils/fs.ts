import { access, mkdir, writeFile } from 'fs/promises';
import { dirname } from 'path';
import readline from 'readline';

/**
 * ファイルが存在するかチェックする
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
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
 * 親ディレクトリを再帰的に作成する
 */
export async function ensureDir(filePath: string): Promise<void> {
  const dir = dirname(filePath);
  await mkdir(dir, { recursive: true });
}

/**
 * ファイルに内容を書き込む
 */
export async function saveFile(filePath: string, content: string): Promise<void> {
  await writeFile(filePath, content, 'utf-8');
}
