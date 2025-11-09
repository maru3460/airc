/**
 * アプリケーション全体で使用する絵文字定数
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
