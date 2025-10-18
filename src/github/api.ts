import https from 'https';
import { GITHUB_API_BASE, REPO_OWNER, REPO_NAME } from '../config.js';
import type { GitHubContentItem, Manifest } from '../types.js';

/**
 * GitHub API を使用してプロファイル配下のファイルリストを取得する
 * @param profile プロファイル名 (例: "default")
 * @returns ファイルパスの配列
 */
export async function getProjectFiles(profile: string): Promise<string[]> {
  const files: string[] = [];

  /**
   * 指定されたパスのディレクトリ内容を再帰的に取得する
   * @param path GitHub リポジトリ内のパス
   */
  async function fetchDirectory(path: string): Promise<void> {
    const apiUrl = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

    return new Promise((resolve, reject) => {
      https.get(apiUrl, {
        headers: {
          'User-Agent': 'airc-cli'
        }
      }, (res) => {
        // ステータスコードのチェック
        if (res.statusCode === 404) {
          reject(new Error(`❌ プロファイルが見つかりません: ${profile}\n\n利用可能なプロファイルは GitHub リポジトリの profiles/ ディレクトリを確認してください。`));
          return;
        }

        if (res.statusCode === 403) {
          const resetTime = res.headers['x-ratelimit-reset'];
          const resetTimeStr = Array.isArray(resetTime) ? resetTime[0] : resetTime;
          const resetDate = resetTimeStr ? new Date(parseInt(resetTimeStr) * 1000).toLocaleString() : '不明';
          reject(new Error(`❌ GitHub API のレート制限に達しました。\n次の時刻以降に再試行してください: ${resetDate}`));
          return;
        }

        if (res.statusCode !== 200) {
          reject(new Error(`❌ GitHub API エラー (${res.statusCode})`));
          return;
        }

        // レスポンスの読み取り
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', async () => {
          try {
            const items: GitHubContentItem[] = JSON.parse(data);

            // 各アイテムの処理
            for (const item of items) {
              if (item.type === 'file') {
                // ファイルの場合、リストに追加
                files.push(item.path);
              } else if (item.type === 'dir') {
                // ディレクトリの場合、再帰的に取得
                await fetchDirectory(item.path);
              }
            }

            resolve();
          } catch (error) {
            reject(new Error(`❌ レスポンスのパースエラー: ${error}`));
          }
        });
      }).on('error', (error) => {
        reject(new Error(`❌ ネットワークエラー: ${error.message}`));
      });
    });
  }

  // プロファイルディレクトリを起点に再帰取得
  await fetchDirectory(`profiles/${profile}`);
  return files;
}

/**
 * マニフェストファイル (files.json) を取得する
 * @param profile プロファイル名 (例: "default")
 * @returns マニフェストオブジェクト、存在しない場合は null
 */
export async function fetchManifest(profile: string): Promise<Manifest | null> {
  const manifestPath = `profiles/${profile}/files.json`;
  const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${manifestPath}`;

  return new Promise((resolve) => {
    https.get(rawUrl, {
      headers: {
        'User-Agent': 'airc-cli'
      }
    }, (res) => {
      // 404 の場合はマニフェストが存在しない
      if (res.statusCode === 404) {
        resolve(null);
        return;
      }

      // その他のエラーもマニフェストなしとして扱う（フォールバック）
      if (res.statusCode !== 200) {
        resolve(null);
        return;
      }

      // レスポンスの読み取り
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const manifest: Manifest = JSON.parse(data);

          // バリデーション: version と files が存在するか確認
          if (!manifest.version || !Array.isArray(manifest.files)) {
            resolve(null);
            return;
          }

          resolve(manifest);
        } catch (error) {
          // パースエラーの場合もマニフェストなしとして扱う
          resolve(null);
        }
      });
    }).on('error', () => {
      // ネットワークエラーの場合もマニフェストなしとして扱う
      resolve(null);
    });
  });
}
