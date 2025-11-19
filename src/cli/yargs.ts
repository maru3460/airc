import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import remoteCommandBuilder from './commands/remote/index.js';
import initCommandBuilder from './commands/init.js';
import listCommandBuilder from './commands/list.js';
import newCommandBuilder from './commands/new.js';
import useCommandBuilder from './commands/use.js';
import renameCommandBuilder from './commands/rename.js';
import deleteCommandBuilder from './commands/delete.js';
import clearCommandBuilder from './commands/clear.js';
import restoreCommandBuilder from './commands/restore.js';

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
    .command(initCommandBuilder)
    .command(listCommandBuilder)
    .command(newCommandBuilder)
    .command(useCommandBuilder)
    .command(renameCommandBuilder)
    .command(deleteCommandBuilder)
    .command(clearCommandBuilder)
    .command(restoreCommandBuilder)
    .command(remoteCommandBuilder)
    .epilogue('詳細: https://github.com/maru3460/airc')
    .strict()  // 未定義のコマンドやオプションでエラー
    .parse();
}
