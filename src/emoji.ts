/**
 * アプリケーション全体で使用する絵文字定数
 * 
 * 無闇に絵文字を使用しない。
 * 使うタイミング
 * - SUCCESS: 特定のコマンドの一連の処理が正常に完了したとき
 * - ERROR: 致命的なエラーが発生したとき
 * - WARNING: 注意喚起や警告を表示するとき
 * - INFO: 廃止予定？
 * - DOWNLOAD: 廃止予定？
 * - SEARCH: 廃止予定？
 * - SYNC: apiを叩く時
 */
export const EMOJI = {
  // ステータス系
  SUCCESS: '✅',
  ERROR: '❌',
  WARNING: '⚠️',
  INFO: 'ℹ️',

  // アクション系
  DOWNLOAD: '🚀',
  SEARCH: '🔍',
  SYNC: '🔄',
} as const;

export type EmojiKey = keyof typeof EMOJI;

/**
 * コンソール出力用のカラーコード（ANSIエスケープシーケンス）
 */
export const COLOR = {
  RESET: '\x1b[0m',
  ACTIVE: '\x1b[38;2;137;195;235m', // #89c3eb
} as const;

/**
 * 文字列にACTIVE色を付けて返す
 * @param text - 色を付ける文字列
 * @returns 色付き文字列
 */
export function colorString(text: string): string {
  return `${COLOR.ACTIVE}${text}${COLOR.RESET}`;
}
