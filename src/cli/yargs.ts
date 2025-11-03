import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import syncCommandBuilder from './commands/sync.js';

// package.json からバージョンを読み込む
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../../package.json'), 'utf-8')
);
const version = packageJson.version;

/**
 * yargsインスタンスを作成してサブコマンドを設定
 */
export function createYargsInstance(args: string[]) {
  return yargs(hideBin(args))
    .scriptName('airc')
    .locale('ja')
    .updateStrings({
      'boolean': 'boolean',
      'string': 'string',
      'number': 'number'
    })
    .usage('$0 <コマンド> [オプション]')
    .version(version)
    .alias('v', 'version')
    .help('h')
    .alias('h', 'help')
    .demandCommand(1, 'コマンドを指定してください。詳細は --help を参照')
    .command(syncCommandBuilder)
    .epilogue('詳細: https://github.com/maru3460/airc')
    .strict()  // 未定義のコマンドやオプションでエラー
    .parse();
}
