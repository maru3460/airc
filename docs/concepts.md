# 基本コンセプト

aircの基本的な概念と用語の説明です。

## 用語集

| 用語 | 説明 |
|------|------|
| 実ファイル | プロジェクトルートに展開されたAIツール設定（`.github/`、`.claude/`、`CLAUDE.md`等）。現在のアクティブプロファイルの内容 |
| .airc | aircツールの管理フォルダ。内部状態と設定を保持 |
| プロファイル | `.sync`で管理対象としたファイルのスナップショット。作業環境ごとに切り替え可能 |
| アクティブプロファイル | 現在選択されているプロファイル |
| プロファイルストア | `.airc/profiles/` 配下。複数のプロファイルを保管 |
| config.json | `.airc/config.json`。現在アクティブなプロファイル名を記録 |
| .sync | `.airc/.sync`。プロファイルに同期するファイルパターンを定義 |

## プロファイルの仕組み

### プロファイルとは

プロファイルは、AIツールの設定ファイルのスナップショットです。`.sync`ファイルで指定されたパターンに一致するファイルが、プロファイルとして`.airc/profiles/<name>/`に保存されます。

### 切り替えの流れ

```
1. airc use work を実行
   ↓
2. 現在のファイルがアクティブプロファイルに保存される
   ↓
3. workプロファイルのファイルがプロジェクトルートに展開される
   ↓
4. アクティブプロファイルがworkに変更される
```

### ディレクトリ構造

```
project/
├── .airc/
│   ├── config.json          # アクティブプロファイル情報
│   ├── .sync                 # 同期パターン定義
│   └── profiles/
│       ├── main/             # デフォルトプロファイル
│       │   ├── .github/
│       │   └── CLAUDE.md
│       └── work/             # workプロファイル
│           ├── .github/
│           └── CLAUDE.md
├── .github/                  # 実ファイル（現在のプロファイル）
├── .claude/
└── CLAUDE.md
```

## リモートプロファイル

### 概要

リモートプロファイルは、GitHubリポジトリからプロファイルをダウンロードする機能です。他の人が公開している設定を簡単に試すことができます。

### デフォルトリモートプロファイルストア

aircは初期設定で [maru3460/airc_profiles](https://github.com/maru3460/airc_profiles) を参照します。

```bash
# デフォルトストアから利用可能なプロファイルを確認
airc remote --list

# デフォルトストアからプロファイルをダウンロード
airc remote sample
```

### カスタムリモートプロファイルストアの利用

チームや個人で独自のプロファイルストアを作成して利用することもできます。

```bash
# 1. リポジトリの接続先を設定
airc remote owner someone
airc remote name ai-settings

# 2. プロファイルをダウンロード
airc remote their-profile
```

これにより、`someone/ai-settings`リポジトリの`their-profile`がローカルにダウンロードされ、すぐに使用できる状態になります。

### リモートプロファイルストアの作り方

独自のリモートプロファイルストアを作成するには、[maru3460/airc_profiles](https://github.com/maru3460/airc_profiles) をフォークして使用します。

詳細な手順は [maru3460/airc_profiles](https://github.com/maru3460/airc_profiles) を参照してください。
