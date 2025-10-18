import { getProjectFiles, fetchManifest } from '../github/api.js';
import { downloadFile } from '../github/download.js';
import type { CliOptions, DownloadStats } from '../types.js';

/**
 * ダウンロードコマンドを実行する
 *
 * @param options CLIオプション
 */
export async function executeDownload(options: CliOptions): Promise<void> {
  const { project, force } = options;

  // 開始メッセージの表示
  console.log(`🚀 プロジェクト「${project}」の設定をダウンロード中...`);

  // まずマニフェストの取得を試みる
  const manifest = await fetchManifest(project);

  let files: string[];

  if (manifest) {
    // マニフェストが存在する場合はそれを使用
    console.log(`📋 マニフェストファイルを使用します (${manifest.files.length} ファイル)`);
    // マニフェストのファイルパスに projects/{project}/ を追加
    files = manifest.files.map(file => `projects/${project}/${file}`);
  } else {
    // マニフェストが存在しない場合は従来の再帰取得にフォールバック
    console.log(`🔍 GitHub API で再帰的にファイルを取得中...`);
    files = await getProjectFiles(project);
  }

  // ダウンロード統計の初期化
  const stats: DownloadStats = {
    downloaded: 0,
    skipped: 0,
    errors: 0
  };

  // ファイルリストのループ処理
  for (const file of files) {
    const result = await downloadFile(file, project, force);

    // 結果に応じてカウンタを更新
    switch (result) {
      case 'success':
        stats.downloaded++;
        break;
      case 'skipped':
        stats.skipped++;
        break;
      case 'error':
        stats.errors++;
        break;
    }
  }

  // 完了メッセージの表示
  console.log(
    `✨ 完了! (${stats.downloaded} 件ダウンロード, ${stats.skipped} 件スキップ, ${stats.errors} 件エラー)`
  );
}
