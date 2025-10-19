import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { DEFAULT_PROJECT } from '../config.js';
import type { CliOptions } from '../types.js';

// package.json からバージョンを読み込む
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../../package.json'), 'utf-8')
);
const version = packageJson.version;

/**
 * yargsを使用したコマンドライン引数パーサー
 *
 * @param args コマンドライン引数配列（通常は process.argv）
 * @returns パース済みのCLIオプション
 */
export function parseArgs(args: string[]): CliOptions {
  const parsed = yargs(hideBin(args))
    .scriptName('airc')
    .locale('ja')
    .updateStrings({
      'boolean': 'boolean',
      'string': 'string',
      'number': 'number'
    })
    .usage('$0 [オプション]')
    .help('h')
    .alias('h', 'help')
    .version(version)
    .alias('v', 'version')
    .option('profile', {
      alias: 'p',
      type: 'string',
      description: 'プロファイル名を指定',
      default: DEFAULT_PROJECT
    })
    .option('force', {
      alias: 'f',
      type: 'boolean',
      description: '既存ファイルを強制上書き',
      default: false
    })
    .option('list', {
      alias: 'l',
      type: 'boolean',
      description: '利用可能なプロファイル一覧を表示',
      default: false
    })
    .example('$0', 'デフォルトプロファイルの設定をダウンロード')
    .example('$0 -p myprofile', '"myprofile" の設定をダウンロード')
    .example('$0 --force', '既存ファイルを強制上書きしてダウンロード')
    .example('$0 --list', '利用可能なプロファイル一覧を表示')
    .epilogue('詳細: https://github.com/maru3460/airc')
    .parseSync();

  return {
    profile: parsed.profile,
    force: parsed.force,
    help: Boolean(parsed.help),
    list: Boolean(parsed.list)
  };
}
