/**
 * airc 専用のベースエラークラス
 */
export class AircError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * GitHub リソースが見つからない (404)
 */
export class GitHubNotFoundError extends AircError {
  constructor(public resource: string) {
    super(
      `リソースが見つかりません: ${resource}\n\n` +
      `利用可能なプロファイルは GitHub リポジトリの profiles/ ディレクトリを確認してください。`
    );
  }
}

/**
 * GitHub API レート制限エラー (403)
 */
export class GitHubRateLimitError extends AircError {
  public resetDate: Date;

  constructor(headers: any) {
    const resetTime = Array.isArray(headers['x-ratelimit-reset'])
      ? headers['x-ratelimit-reset'][0]
      : headers['x-ratelimit-reset'];

    const resetDate = resetTime
      ? new Date(parseInt(resetTime) * 1000)
      : new Date();

    super(`GitHub API のレート制限に達しました。次の時刻以降に再試行してください: ${resetDate.toLocaleString()}`);
    this.resetDate = resetDate;
  }
}

/**
 * GitHub API の一般的なエラー（ステータスコード付き）
 */
export class GitHubApiError extends AircError {
  constructor(public statusCode: number | undefined) {
    super(`GitHub API エラー (${statusCode ?? '不明'})`);
  }
}

/**
 * パスバリデーションエラー（セキュリティ）
 */
export class PathValidationError extends AircError {
  constructor(public invalidPath: string) {
    super(`不正なパスが検出されました: ${invalidPath}`);
  }
}

/**
 * ファイルダウンロードエラー
 */
export class FileDownloadError extends AircError {
  constructor(
    public file: string,
    public reason: string
  ) {
    super(`ダウンロード失敗: ${file} (${reason})`);
  }
}

/**
 * レスポンスのパースエラー
 */
export class ResponseParseError extends AircError {
  constructor(originalError: unknown) {
    super(`レスポンスのパースに失敗しました: ${originalError}`);
  }
}

/**
 * ネットワークエラー
 */
export class NetworkError extends AircError {
  constructor(originalError: Error) {
    super(`ネットワークエラー: ${originalError.message}`);
  }
}

/**
 * ファイルシステム操作エラー
 */
export class FileOperationError extends AircError {
  constructor(
    public operation: string,
    public path: string,
    public code?: string,
    public details?: string
  ) {
    const message = code && details
      ? `ファイル操作エラー (${operation}): ${path} (${code}: ${details})`
      : `ファイル操作エラー (${operation}): ${path}`;
    super(message);
  }
}
