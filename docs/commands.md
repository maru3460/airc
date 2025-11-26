# コマンドリファレンス

aircの全コマンドの詳細説明です。

## init - 初期化

```bash
airc init
airc init --force
```

`.airc/`ディレクトリを作成し、設定ファイルとデフォルトプロファイルを初期化します。

**オプション:**
- `--force`: 既存の設定を検証・修復

## list - プロファイル一覧

```bash
airc list
```

ローカルの全プロファイルを表示します。アクティブなプロファイルには`*`マークが付きます。

## new \<name\> - 新規プロファイル作成

```bash
airc new work
```

指定した名前で新しいプロファイルを作成します。

## use \<name\> - プロファイル切り替え

```bash
airc use work
```

指定したプロファイルに切り替えます。現在のファイルは自動的にアクティブプロファイルに保存されます。

## rename \<old\> \<new\> - リネーム

```bash
airc rename old-name new-name
```

既存のプロファイルをリネームします。

## delete \<name\> - 削除

```bash
airc delete myprofile
```

指定したプロファイルを削除します。アクティブなプロファイルは削除できません。

## clear - 実ファイル削除

```bash
airc clear
airc clear --force
```

`.sync`パターンに一致する実ファイルを削除します。

**オプション:**
- `--force`: 確認なしで削除

## restore \<name\> - 復元

```bash
airc restore myprofile
airc restore myprofile --force
```

指定したプロファイルから実ファイルに復元します。

**オプション:**
- `--force`: 確認なしで復元

## remote - リモートプロファイル連携

デフォルトのリモートプロファイルストア: [maru3460/airc_profiles](https://github.com/maru3460/airc_profiles)

### プロファイルのダウンロード

```bash
airc remote default
airc remote default --force
```

GitHubリポジトリからプロファイルをダウンロードして使用します。デフォルトでは `maru3460/airc_profiles` から取得します。

**オプション:**
- `--force`: 実ファイルへの展開時に既存ファイルを上書き

### リモートプロファイル一覧

```bash
airc remote --list
```

リモートで利用可能なプロファイル一覧を表示します。

### リポジトリ設定

```bash
airc remote owner [value]   # オーナーを取得または設定
airc remote name [value]    # リポジトリ名を取得または設定
airc remote branch [value]  # ブランチを取得または設定
```

リモートリポジトリの接続先を設定します。値を省略すると現在の設定を表示します。

**カスタムリモートプロファイルストアの利用例:**

```bash
# チーム用リポジトリに切り替え
airc remote owner my-team
airc remote name team-profiles

# チーム用プロファイルをダウンロード
airc remote --list
airc remote standard
```
