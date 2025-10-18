## プロジェクト概要

**airc (AI Resource Configurator)** は、GitHub リポジトリに保存された AI ツール設定ファイル（GitHub Copilot、Claude）をローカルプロジェクトにダウンロード・同期するための CLI ツールです。

## アーキテクチャ

### 技術スタック

- **言語**: TypeScript (ES2022)
- **ランタイム**: Node.js 18.0.0+
- **配布**: npm package (`@maru3460/airc`)

### 実装構造

- **モジュール構成**: `src/` 配下に機能別ファイル分割（ビルド後は `bin/` に出力）
- **GitHub API**: 認証不要（Public リポジトリ前提）でファイルリストを動的に取得
- **ダウンロード元**: `raw.githubusercontent.com` から直接ダウンロード

## リポジトリ構造

```
airc/
├── src/                    # TypeScript ソースコード
├── bin/                    # ビルド出力先（npm 配布用）
├── package.json            # npm パッケージ設定
├── tsconfig.json           # TypeScript 設定
└── projects/               # 設定ファイルの保存先
    ├── default/            # デフォルトプロジェクト（プロジェクト指定なしで使用）
    │   ├── .github/
    │   │   ├── chatmodes/  # GitHub Copilot チャットモード設定
    │   │   └── prompts/    # GitHub Copilot プロンプト設定
    │   ├── .claude/        # Claude 設定
    │   └── CLAUDE.md       # Claude ルート設定ファイル
    └── {project-name}/     # カスタムプロジェクト（追加可能）
```

## 処理フロー

### メイン処理

1. コマンドライン引数解析（`-p`, `--force`, `--help`）
2. プロジェクト指定なし → `project = "default"`
3. GitHub API でプロジェクト存在確認 & ファイルリスト取得（再帰的）
4. 各ファイルをダウンロード（上書き確認あり、または `--force` で強制上書き）
5. 結果表示

### ダウンロード処理

- GitHub パス（例: `projects/default/.github/chatmodes/file.md`）
- → raw URL 構築: `https://raw.githubusercontent.com/maru3460/airc/main/{path}`
- → ローカルパス変換: `projects/{project}/` を除去 → `.github/chatmodes/file.md`
- → ファイル存在チェック & 上書き確認
- → ディレクトリ作成 & ファイル書き込み

## 開発時の重要事項

### コマンドライン引数

- **プロジェクト指定**: `-p <project-name>` または `--project <project-name>` (デフォルト: `default`)
- **強制上書き**: `-f` または `--force`
- **ヘルプ**: `-h` または `--help`

### エラーハンドリング

- **致命的エラー**（処理中断）: プロジェクト未存在（404）、GitHub API レート制限超過（403）
- **非致命的エラー**（継続）: 個別ファイルのダウンロード失敗、書き込みエラー

### GitHub API

- **認証不要**: Public リポジトリ前提
- **レート制限**: 60 リクエスト/時間（未認証）
- **ファイルリスト取得**: `GET /repos/{owner}/{repo}/contents/projects/{project}` を再帰的に実行

### プロジェクト追加方法

1. `projects/` 配下に新プロジェクトディレクトリを作成
2. `.github/chatmodes/`, `.github/prompts/`, `.claude/` 等を配置
3. GitHub に push（コード側の修正不要、GitHub API で自動認識）

## 開発コマンド

```bash
# ビルド（TypeScript → JavaScript）
npm run build

# 開発モード（watch）
npm run dev

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
- **GitHub API の再帰呼び出し**: ディレクトリを走査してファイルリストを動的取得
- **パス変換**: `projects/{project}/` プレフィックスを除去してローカルパス生成
- **エラーメッセージ**: ユーザーフレンドリーなメッセージ（絵文字アイコン使用）
- **ビルド**: TypeScript → JavaScript へのトランスパイル（`npm run build`）
