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

## 📝 config.jsonファイル

`.airc/config.json`ファイルはaircの設定を保持するファイルなのだ。
⚠️ このファイルをユーザーが手動で変更した際の動作の保証はしないのだ。

## 📝 .sync ファイル

`.airc/.sync` ファイルは、プロファイルと同期するファイルを glob パターンで定義するのだ。

### 基本的な使い方

```bash
# ディレクトリ: そのディレクトリ以下のすべてのファイルを同期
.github/
.claude/

# ファイル: 特定のファイルを同期
CLAUDE.md

# ワイルドカード: パターンマッチング
*.md
.github/**/*.md

# 除外パターン: '!' で始まるパターンは除外
!.github/workflows/
!*.log
```

### .sync 変更時の重要な注意点

⚠️ **`.sync` ファイルを変更しても、既に展開されているファイルは自動的に削除されないのだ！**

#### 動作の仕組み

1. **`.sync` の読み込みタイミング**
   - コマンド実行時（`airc use`、`airc clear` など）に毎回読み込まれる
   - 変更は次回コマンド実行時から反映される

2. **既存ファイルへの影響**
   ```bash
   # 例: .github/ をパターンから削除した場合

   # 1. 初期状態
   .sync: .github/
   # → .github/ ディレクトリが展開されている

   # 2. .sync を編集
   .sync: .claude/  # .github/ を削除

   # 3. この時点では .github/ は残っている！
   ls .github/  # まだ存在する

   # 4. airc clear で削除が必要
   airc clear   # 新しいパターンに基づいて削除
   ls .github/  # ディレクトリは残るがファイルは削除される
   ```

3. **プロファイル切り替え時の挙動**
   - `airc use` 実行時に現在の `.sync` パターンで保存される
   - パターンから除外されたファイルは保存されない
   - 次回そのプロファイルに切り替えても、除外されたファイルは復元されない

#### 推奨ワークフロー

`.sync` パターンを変更した場合は、以下の手順で同期を取り直すのだ：

```bash
# 1. 現在のファイルを保存（オプション）
airc use [current-profile]

# 2. .sync を編集
vi .airc/.sync

# 3. 不要なファイルを削除
airc clear

# 4. プロファイルを再展開（必要に応じて）
airc use [profile-name]
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
