# ディレクトリ構成リファクタ計画（確定版）

## 現状の問題点 🤔

### 1. `src/github/` の問題
- ディレクトリ名が `github` なのは、GitHub特有の処理っぽく見える
- 実際には「外部APIとの通信」なので、より汎用的な名前が望ましい
- 将来的に GitLab や他の VCS に対応する場合も `api/` なら違和感なく拡張できる

### 2. 責務の分散が中途半端
- `github/api.ts` → GitHub APIを使った**メタデータ取得**（プロファイル一覧、ファイルリスト、マニフェスト）
- `github/download.ts` → **ファイルのダウンロード処理**全体（パス検証、上書き確認、HTTP通信、ファイル保存まで含む）
- `utils/http.ts` → **低レベルのHTTP通信**（`fetchFromGitHub` と `downloadFromGitHub` の2種類）

### 3. `github/download.ts` の責務過多 ⚠️
現状の `downloadFile` 関数は以下の**全て**をやっている：
1. パス検証（セキュリティ）
2. ファイル存在チェック
3. 上書き確認（ユーザー入力）
4. HTTP通信
5. ファイル保存

→ **`api/` は「GitHubとの通信」だけに専念すべき**なのに、ファイルシステム操作やUI処理まで含んでいる

---

## 設計方針 🎯

### レイヤーの分離
- **`cli/commands/`**: 手続き的処理（処理の流れ制御、UI、エラー集約）
- **それ以外**: 宣言的な道具（単一責務、副作用なし or 最小限）

### 責務の明確化
- **`api/`**: GitHubとのHTTP通信のみ（ファイルシステム操作やUI処理は含まない）
- **`http/`**: 低レベルHTTP通信
- **`utils/`**: 汎用ユーティリティ（ファイル操作、パス操作）
- **`cli/commands/`**: 処理の流れ、UI、エラー集約（手続き的）

---

## 確定案：シンプルなフラット構造 ✨

```
src/
├── api/
│   ├── getAvailableProfiles.ts   # プロファイル一覧取得（GitHub API）
│   ├── getProjectFiles.ts        # ファイルリスト取得（再帰）
│   ├── fetchManifest.ts          # マニフェスト取得
│   └── downloadFileContent.ts    # ファイル内容のダウンロード（raw URLから）
├── http/
│   ├── fetch.ts                   # GitHub API用HTTPリクエスト (fetchFromGitHub)
│   └── download.ts                # ファイルダウンロード用HTTPリクエスト (downloadFromGitHub + DownloadResponse型)
├── utils/
│   ├── fs.ts                      # ファイルシステム操作
│   └── path.ts                    # パス操作
├── cli/
│   ├── yargs.ts                   # CLI引数パース
│   └── commands/
│       ├── listProfiles.ts        # プロファイル一覧表示
│       └── syncProfiles.ts        # プロファイル同期（手続き的処理）
├── types.ts                       # 共通型定義
├── config.ts                      # 設定
├── emoji.ts                       # 絵文字定数
└── cli.ts                         # エントリーポイント
```

### 採用理由

1. **シンプルで明快** - ファイル名から関数名が推測できる
2. **検索しやすい** - フラット構造なので迷わない
3. **モジュール性が高い** - 一関数一ファイルで独立性が高い
4. **将来の拡張性** - 新しい関数を追加する時も迷わない（GitLab対応なども視野に入る）
5. **責務が明確** - 手続き的処理は `cli/commands/` のみ、他は宣言的な道具

---

## 主な変更点

### 1. `src/github/` → `src/api/`
- より汎用的な命名に変更
- GitHub以外のVCSにも対応しやすい

### 2. `utils/http.ts` → `http/` ディレクトリに昇格
- HTTP通信は十分に重要な責務なので、独立したディレクトリに
- `fetch.ts` と `download.ts` に分割

### 3. `github/download.ts` → `api/downloadFileContent.ts`
- **責務を大幅に削減**: GitHubからファイル内容を取得するだけ
- パス検証、上書き確認、ファイル保存は `cli/commands/syncProfiles.ts` に移動

### 4. `cli/commands/` の命名を簡潔に
- `displayAvailableProfiles.ts` → `listProfiles.ts`
- `downloadProfiles.ts` → `syncProfiles.ts`（同期の意味を明確化）

---

## 各ファイルの責務

### `api/downloadFileContent.ts`（宣言的な道具）
**責務**: GitHubからファイル内容を取得するだけ

```typescript
// 宣言的: 「このファイルをダウンロードして」→ 結果を返す
export async function downloadFileContent(
  filePath: string
): Promise<DownloadResponse> {
  const rawUrl = `${GITHUB_RAW_BASE}/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${filePath}`;
  return await downloadFromGitHub(rawUrl, MAX_FILE_SIZE);
}
```

---

### `cli/commands/syncProfiles.ts`（手続き的処理）
**責務**: 処理の流れ制御、UI、エラー集約

この中で以下を**手続き的に**実行：
1. マニフェスト取得
2. ファイルリスト取得
3. 各ファイルに対して：
   - ローカルパス生成（`toLocalPath`）
   - README.md 除外チェック
   - パス検証（`isValidPath`）
   - ファイル内容ダウンロード（`downloadFileContent`）
   - ファイル存在チェック（`fileExists`）
   - 上書き確認（`askOverwrite`）
   - ディレクトリ作成（`ensureDir`）
   - ファイル保存（`saveFile`）
4. エラー集約と表示

**ポイント**:
- 処理の流れは `syncProfiles.ts` が全て制御
- 他のモジュールは「道具」として呼び出されるだけ
- UI（console.log）もここに集約

---

## 移行手順

### ステップ1: `src/github/` → `src/api/` にリネーム
```bash
git mv src/github src/api
```

### ステップ2: `utils/http.ts` を `http/` ディレクトリに移動
```bash
mkdir -p src/http
git mv src/utils/http.ts src/http/index.ts  # 一旦移動
```

### ステップ3: `http/index.ts` を分割
- `fetchFromGitHub` → `src/http/fetch.ts`
- `downloadFromGitHub` + `DownloadResponse` 型 → `src/http/download.ts`

**理由**: `DownloadResponse` は `downloadFromGitHub` 専用の型なので、同じファイルに含める

### ステップ4: `api/api.ts` を分割
- `getAvailableProfiles` → `src/api/getAvailableProfiles.ts`
- `getProjectFiles` → `src/api/getProjectFiles.ts`
- `fetchManifest` → `src/api/fetchManifest.ts`

### ステップ5: `api/download.ts` をリネーム & 大幅に簡略化
- `src/api/download.ts` → `src/api/downloadFileContent.ts`
- **責務を大幅削減**: パス検証、上書き確認、ファイル保存の処理を削除
- GitHubからファイル内容を取得するだけの関数に変更

### ステップ6: `cli/commands/` のファイル名を変更 & 処理を移動
- `src/cli/commands/displayAvailableProfiles.ts` → `src/cli/commands/listProfiles.ts`
- `src/cli/commands/downloadProfiles.ts` → `src/cli/commands/syncProfiles.ts`
- **`syncProfiles.ts` に手続き的処理を集約**:
  - パス検証、上書き確認、ファイル保存の処理を追加
  - `downloadFileContent` を呼び出してファイル内容を取得
  - `utils/fs.ts`, `utils/path.ts` の関数を呼び出して保存処理を実行

### ステップ7: 各ファイルの import パスを修正
以下のようなimport文の変更が必要：
- `from '../utils/http.js'` → `from '../http/fetch.js'` または `from '../http/download.js'`
- `from './github/api.js'` → `from './api/getAvailableProfiles.js'` など
- `from './github/download.js'` → `from './api/downloadFileContent.js'`

### ステップ8: `utils/` の確認
- `path.ts` と `fs.ts` は残す（これらは本当にユーティリティなので問題なし）
- `path.ts` の `isValidPath` はそのまま（`syncProfiles.ts` から呼び出す）

### ステップ9: ビルド & 動作確認
```bash
npm run build
node bin/cli.js --list
node bin/cli.js --profile default
```

---

## 型定義の扱い

### 関数専用の型: 関数と同じファイルに配置
- `DownloadResponse` 型 → `http/download.ts` に含める
- その関数でしか使わない型は、同じファイルにあった方が見通しが良い

### 共通で使われる型: `types.ts` に配置
- `FileEntry`, `Manifest`, `CliOptions`, `DownloadResult`, `DownloadErrors` など、複数のファイルで使われる型

---

## 注意点 ⚠️

### 1. import パスの `.js` 拡張子を忘れない
- TypeScript では `.ts` で書くが、ESM 形式では `.js` で import する必要がある
- 例: `import { fetchFromGitHub } from '../http/fetch.js'`

### 2. 循環参照に注意
- ファイルを分割する際、循環参照が発生しないように気をつける
- 特に `api/` と `http/` の関係に注意

### 3. ビルド後の `bin/` ディレクトリ構造も変わる
- `src/api/` → `bin/api/` のように対応する
- `package.json` の `bin` フィールドは変更不要（`bin/cli.js` のまま）

### 4. Git履歴を保持したい場合
```bash
# ファイル名の変更履歴を保持する場合
git mv src/github src/api
git mv src/utils/http.ts src/http/index.ts
```

---

## リファクタ後のメリット 🎯

### 1. 責務の明確化
- `http/`: 低レベルHTTP通信（純粋）
- `api/`: GitHubとのやりとり（純粋、HTTP通信のみ）
- `utils/`: 汎用ユーティリティ（単一責務）
- `cli/commands/`: 手続き的処理（処理の流れ制御、UI、エラー集約）

### 2. 検索性の向上
- 関数名 = ファイル名なので、エディタの検索で即座に見つかる

### 3. テストしやすさ
- 一関数一ファイルなので、ユニットテストが書きやすい
- `api/downloadFileContent` は単純なHTTP通信なのでモック化しやすい
- `utils/` の関数も純粋なのでテストしやすい

### 4. 将来の拡張性
- GitLab対応、他のVCS対応も `api/` に追加するだけ
- `api/gitlab/` のようなサブディレクトリも作りやすい

### 5. 宣言的な設計
- コマンド層以外は「道具」として機能
- 「このファイルをダウンロードして」「このパスは有効？」のように宣言的に使える

---

以上です！🍛✨
