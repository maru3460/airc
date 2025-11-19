// ダウンロード結果
export type DownloadResult =
  | { status: 'success' }
  | { status: 'skipped' }
  | { status: 'error'; reason: string };


// ダウンロードエラー情報
export type DownloadErrors = Array<{ file: string; reason: string }>;

// GitHub API レスポンスのアイテム型
export interface GitHubContentItem {
  name: string; // アイテム名
  path: string; // リポジトリ内のパス
  type: 'file' | 'dir'; // タイプ（file または dir）
  download_url?: string; // ダウンロード URL
}

// マニフェストファイル (files.json) の型定義
export interface Manifest {
  version: string; // マニフェストのバージョン
  files: string[]; // ファイルパスのリスト
}

// リポジトリ設定
export interface RepoConfig {
  owner: string;   // リポジトリオーナー
  name: string;    // リポジトリ名
  branch: string;  // ブランチ名
}

// ローカルプロファイル設定
export interface LocalConfig {
  current: string;    // アクティブプロファイル名
  repo: RepoConfig;   // リモートリポジトリ設定
}

// .sync ファイルのパターン
export interface SyncPattern {
  include: string[]; // 含めるパターン
  exclude: string[]; // 除外するパターン
}
