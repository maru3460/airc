// ダウンロード結果
export type DownloadResult =
  | { status: 'success' }
  | { status: 'skipped' }
  | { status: 'error'; reason: string };

// CLI オプション
export interface CliOptions {
  profile: string; // プロファイル名
  force: boolean; // 強制上書きフラグ
  help: boolean; // ヘルプ表示フラグ
  list: boolean; // プロファイル一覧表示フラグ
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
