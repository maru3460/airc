# airc

**airc (AI Resource Configurator)** は、AIツールの設定ファイル（GitHub Copilot、Claude）をプロファイルとして管理するCLIツールなのだ。複数のプロファイルを簡単に切り替えて、チームで設定を共有できるのだ！

## ⚡ クイックスタート

```bash
# npmパッケージとしてインストール
npm install -g @maru3460/airc

# 初期化
airc init

# リモートプロファイルをダウンロード
airc sync default
```

## 🚀 使い方

### ローカルプロファイル管理

```bash
airc init                    # 初期化（.airc/ディレクトリ作成）
airc list                    # ローカルプロファイル一覧
airc new myprofile           # 新規プロファイル作成
airc use myprofile           # プロファイル切り替え
airc rename old new          # プロファイルリネーム
airc delete myprofile        # プロファイル削除
airc clear                   # 実ファイル削除
```

### リモートプロファイル連携

```bash
airc sync --list             # リモートプロファイル一覧
airc sync default            # リモートからダウンロード&切り替え
airc sync default --force    # 既存ファイルを強制上書き
```

## ⚙️ オプション

### `init` - 初期化

```bash
airc init
```

`.airc/`ディレクトリを作成し、設定ファイルとデフォルトプロファイルを初期化するのだ。

### `list` - プロファイル一覧

```bash
airc list
```

ローカルの全プロファイルを表示。アクティブなプロファイルには`*`マークが付くのだ。

### `new <name>` - 新規プロファイル作成

```bash
airc new work
```

指定した名前で新しいプロファイルを作成するのだ。

### `use <name>` - プロファイル切り替え

```bash
airc use work
```

指定したプロファイルに切り替え。現在のファイルは自動的に保存されるのだ。

### `rename <old> <new>` - リネーム

```bash
airc rename old-name new-name
```

既存のプロファイルをリネームするのだ。

### `delete <name>` - 削除

```bash
airc delete myprofile
```

指定したプロファイルを削除。アクティブなプロファイルは削除できないのだ。

### `clear` - 実ファイル削除

```bash
airc clear
```

`.sync`パターンに一致する実ファイルを削除するのだ。

### `sync [name]` - リモート同期

```bash
airc sync default             # defaultプロファイルをダウンロード&切り替え
airc sync --list              # リモートプロファイル一覧
airc sync default --force     # 既存ファイルを強制上書き
```

GitHubリポジトリからプロファイルをダウンロードして使用するのだ。

**オプション**:
- `--list`: リモートで利用可能なプロファイル一覧を表示
- `--force`: 実ファイルへの展開時に既存ファイルを上書き

## 📋 要件

- Node.js ≥ 18.0.0

## 📄 ライセンス

MIT
