/**
 * ダウンロード結果の種類
 */
export type DownloadResult = 'success' | 'skipped' | 'error';

/**
 * CLI オプション
 */
export interface CliOptions {
  /** プロファイル名 */
  profile: string;
  /** 強制上書きフラグ */
  force: boolean;
  /** ヘルプ表示フラグ */
  help: boolean;
}

/**
 * ダウンロード統計
 */
export interface DownloadStats {
  /** 成功件数 */
  downloaded: number;
  /** スキップ件数 */
  skipped: number;
  /** エラー件数 */
  errors: number;
}

/**
 * GitHub API レスポンスのアイテム型
 */
export interface GitHubContentItem {
  /** アイテム名 */
  name: string;
  /** リポジトリ内のパス */
  path: string;
  /** タイプ（file または dir） */
  type: 'file' | 'dir';
  /** ダウンロード URL */
  download_url?: string;
}

/**
 * マニフェストファイル (files.json) の型定義
 */
export interface Manifest {
  /** マニフェストのバージョン */
  version: string;
  /** ファイルパスのリスト */
  files: string[];
}
