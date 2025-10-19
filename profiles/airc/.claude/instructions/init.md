## プロジェクト概要

**airc (AI Resource Configurator)** は、GitHub リポジトリに保存された AI ツール設定ファイル（GitHub Copilot、Claude）をローカルプロジェクトにダウンロード・同期するための CLI ツールです。

## アーキテクチャ

### 技術スタック

- **言語**: TypeScript (ES2022)
- **ランタイム**: Node.js 18.0.0+
- **配布**: npm package (`@maru3460/airc`)

### 実装構造

- **モジュール構成**: `src/` 配下に機能別ファイル分割（ビルド後は `bin/` に出力）
- **GitHub API**: マニフェストファイル (`files.json`) を優先的に使用、存在しない場合は従来の再帰的取得にフォールバック
- **ダウンロード元**: `raw.githubusercontent.com` から直接ダウンロード
- **マニフェスト自動生成**: pre-commit hook で `files.json` を自動更新

## リポジトリ構造

```
airc/
├── src/                    # TypeScript ソースコード
├── bin/                    # ビルド出力先（npm 配布用）
├── scripts/                # ユーティリティスクリプト
│   └── generate-manifest.js # マニフェスト自動生成スクリプト
├── package.json            # npm パッケージ設定
├── tsconfig.json           # TypeScript 設定
└── profiles/               # 設定ファイルの保存先
    ├── default/            # デフォルトプロファイル（プロファイル指定なしで使用）
    │   ├── .github/
    │   │   ├── chatmodes/  # GitHub Copilot チャットモード設定
    │   │   └── prompts/    # GitHub Copilot プロンプト設定
    │   ├── .claude/        # Claude 設定
    │   ├── files.json      # マニフェストファイル（自動生成）
    │   └── CLAUDE.md       # Claude ルート設定ファイル
    └── {profile-name}/     # カスタムプロファイル（追加可能）
        └── files.json      # マニフェストファイル（自動生成）
```

## 処理フロー

### メイン処理

1. コマンドライン引数解析（`--profile`, `--force`, `--help`）
2. プロファイル指定なし → `profile = "default"`
3. **マニフェスト取得を試行**
   - `profiles/{profile}/files.json` が存在すれば使用（1 リクエストのみ）
   - 存在しない場合は GitHub API で再帰的にファイルリスト取得（フォールバック）
4. 各ファイルをダウンロード（上書き確認あり、または `--force` で強制上書き）
5. 結果表示

### ダウンロード処理

- GitHub パス（例: `profiles/default/.github/chatmodes/file.md`）
- → raw URL 構築: `https://raw.githubusercontent.com/maru3460/airc/main/{path}`
- → ローカルパス変換: `profiles/{profile}/` を除去 → `.github/chatmodes/file.md`
- → ファイル存在チェック & 上書き確認
- → ディレクトリ作成 & ファイル書き込み

## 開発時の重要事項

### コマンドライン引数

- **プロファイル指定**: `--profile <profile-name>` (デフォルト: `default`)
- **強制上書き**: `-f` または `--force`
- **ヘルプ**: `-h` または `--help`

### エラーハンドリング

- **致命的エラー**（処理中断）: プロファイル未存在（404）、GitHub API レート制限超過（403）
- **非致命的エラー**（継続）: 個別ファイルのダウンロード失敗、書き込みエラー

### GitHub API

- **認証不要**: Public リポジトリ前提
- **レート制限**: 60 リクエスト/時間（未認証）
- **マニフェスト方式**（推奨）:
  - `files.json` を使用することで API リクエストを 1 回に削減
  - レート制限到達のリスクをほぼゼロに
- **フォールバック方式**:
  - マニフェストが存在しない場合は `GET /repos/{owner}/{repo}/contents/profiles/{profile}` を再帰的に実行

### プロファイル追加方法

1. `profiles/` 配下に新プロファイルディレクトリを作成
2. `.github/chatmodes/`, `.github/prompts/`, `.claude/` 等を配置
3. `git commit` で自動的に `files.json` が生成される（pre-commit hook）
4. GitHub に push（コード側の修正不要）

## 開発コマンド

```bash
# ビルド（TypeScript → JavaScript）
npm run build

# 開発モード（watch）
npm run dev

# マニフェスト手動生成（通常は pre-commit hook で自動実行）
node scripts/generate-manifest.js

# ローカルテスト実行
node bin/cli.js
node bin/cli.js -p default
node bin/cli.js --force

# npm公開
npm version <patch|minor|major>
npm publish
```

## セキュリティ考慮事項

- **パス検証**: ディレクトリトラバーサル防止（`../` などを拒否）
- **通信**: HTTPS 通信のみ（`api.github.com`, `raw.githubusercontent.com`）
- **書き込み先制限**: カレントディレクトリ配下のみ
- **機密情報**: リポジトリに API キーやパスワードを含めない

## 実装時の注意点

- **モジュール分割**: 機能ごとに適切にファイルを分割し、型安全性を保つ
- **マニフェスト優先**: まず `files.json` の取得を試み、失敗時のみ再帰的取得にフォールバック
- **パス変換**: `profiles/{profile}/` プレフィックスを除去してローカルパス生成
- **エラーメッセージ**: ユーザーフレンドリーなメッセージ（絵文字アイコン使用）
- **ビルド**: TypeScript → JavaScript へのトランスパイル（`npm run build`）
- **pre-commit hook**: `simple-git-hooks` により、コミット時に自動でマニフェスト生成・staging

## マニフェストファイル形式

`files.json` は各プロファイルディレクトリ直下に配置され、以下の形式を持ちます：

```json
{
  "version": "1.0",
  "files": [
    ".github/chatmodes/file1.md",
    ".github/prompts/file2.md",
    ".claude/instructions.md",
    "CLAUDE.md"
  ]
}
```

- **自動生成**: `scripts/generate-manifest.js` により自動生成
- **パス形式**: プロファイルディレクトリからの相対パス
- **除外ファイル**: `files.json` 自身は除外される
