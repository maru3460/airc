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

## new <name> - 新規プロファイル作成

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

**使用場面:**
- プロファイルに保存されているファイルを一時的に無効化したい場合
- 設定ファイルをクリーンな状態にしたい場合

**注意:** プロファイルストア内のデータは削除されません。`restore`コマンドで復元できます。

## restore \<name\> - 展開

```bash
airc restore myprofile
airc restore myprofile --force
```

指定したプロファイルを実ファイルに展開します。

**オプション:**
- `--force`: 確認なしで展開

**使用場面:**
- `clear`コマンドで削除したファイルを復元する場合
- アクティブプロファイルを変更せずに特定のプロファイルを展開したい場合

**clearとrestoreの違い:**
- `clear`: 実ファイルを削除するだけ（プロファイルは保持）
- `restore`: プロファイルから実ファイルに展開するだけ（アクティブプロファイルは変更されない）
- `use`: 実ファイルを保存してから別のプロファイルに切り替える（アクティブプロファイルが変更される）

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

#### トークンの設定

```bash
airc remote token [value]      # トークンを取得または設定
airc remote token --remove     # トークンを削除
```

プライベートリポジトリからプロファイルをダウンロードする場合は、適切なスコープ（`repo`）を持つGitHub Personal Access Tokenを設定してください。

**トークンの作成方法:**

1. GitHubの設定 > Developer settings > Personal access tokens > Tokens (classic)
2. 「Generate new token」をクリック
3. `repo` スコープを選択
4. トークンを生成してコピー
5. `airc remote token <your-token>` で設定

**セキュリティ:**

- トークンは `.airc/config.json` に保存されます
- config.jsonは所有者のみ読み書き可能な権限（0600）で保存されます
- トークンを表示する際は自動的にマスクされます（例: `ghp_****...xyz`）

**使用例:**

```bash
# プライベートリポジトリの設定
airc remote owner my-company
airc remote name private-profiles
airc remote token ghp_xxxxxxxxxxxx

# プロファイルをダウンロード
airc remote company-standard
```

**カスタムリモートプロファイルストアの利用例:**

```bash
# チーム用リポジトリに切り替え
airc remote owner my-team
airc remote name team-profiles

# チーム用プロファイルをダウンロード
airc remote --list
airc remote standard
```
