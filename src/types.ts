// ダウンロード結果
export type DownloadResult =
  | { status: 'success' }
  | { status: 'skipped' }
  | { status: 'error'; reason: string };

// syncコマンド用のオプション
export interface SyncOptions {
  profile: string; // プロファイル名
  force: boolean; // 強制上書きフラグ
  list: boolean; // プロファイル一覧表示フラグ
}

// listコマンド用のオプション（現時点ではオプションなし）
export interface ListOptions {
  // 将来的に --json などを追加可能
}

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

// ローカルプロファイル設定
export interface LocalConfig {
  current: string; // アクティブプロファイル名
}

// .sync ファイルのパターン
export interface SyncPattern {
  include: string[]; // 含めるパターン
  exclude: string[]; // 除外するパターン
}
