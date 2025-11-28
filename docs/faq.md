# FAQ

よくある質問と回答をまとめたページです。

## 基本的な使い方

### プロファイルを削除すると何が起こるのか？

`airc delete <name>` でプロファイルを削除すると：

- `.airc/profiles/<name>/` ディレクトリとその中身がすべて削除されます
- 実ファイル（プロジェクトルートに展開されたファイル）は削除されません
- アクティブなプロファイルは削除できません（エラーになります）

削除したプロファイルは復元できないため、重要なプロファイルは削除前にバックアップを取ることを推奨します。

### .airc をgitで管理すべきか？

**推奨しません。**

理由：
- `.airc/` には複数のプロファイルが含まれており、すべてをコミットすると不要な設定まで共有される
- プロファイルは個人の作業環境に依存するため、チームで共有する必要がない
- `.airc/config.json` には個人のアクティブプロファイル情報が含まれる

チームで設定を共有したい場合は、以下のいずれかの方法を推奨します：
- リモートプロファイルストアを利用する（推奨）
- 特定のプロファイルのみを別リポジトリで管理する

### 複数のプロジェクトで同じプロファイルを共有できるか？

**できません。**

aircのプロファイルはプロジェクトごとに独立しています（`.airc/` ディレクトリがプロジェクトルートに作成されるため）。

複数のプロジェクトで同じ設定を使いたい場合は：
1. リモートプロファイルストアにプロファイルを登録
2. 各プロジェクトで `airc remote <profile>` を実行してダウンロード

### プロファイル名に使える文字は？

プロファイル名は以下のルールに従います：

- 使える文字: 英数字、ハイフン(`-`)、アンダースコア(`_`)
- 使えない文字: スペース、スラッシュ(`/`)、バックスラッシュ(`\`)、特殊文字
- 長さ: 1文字以上

例：
- ✅ `work`, `experimental`, `team-standard`, `v1_backup`
- ❌ `my profile`, `config/v1`, `設定`

### プロファイルの最大数は？

技術的な制限はありませんが、多すぎると管理が難しくなります。

実用上の推奨：
- 個人使用: 3-5個
- チーム使用: 5-10個

不要になったプロファイルは定期的に削除することを推奨します。

## トラブルシューティング

### プロファイル切り替えが反映されない

**原因1: `.sync` の設定が不足している**

`.airc/.sync` に必要なファイルパターンが含まれているか確認してください。

```bash
cat .airc/.sync
```

**原因2: ファイルが正しく展開されていない**

プロファイルを明示的に展開してみてください：

```bash
airc restore <profile> --force
```

**原因3: アクティブプロファイルが意図したものと異なる**

現在のアクティブプロファイルを確認：

```bash
airc list  # アクティブなプロファイルに * が付く
```

または：

```bash
cat .airc/config.json
```

### リモートダウンロードが失敗する

**エラー: "Repository not found"**

リモート設定を確認してください：

```bash
airc remote owner  # オーナー名を確認
airc remote name   # リポジトリ名を確認
airc remote branch # ブランチ名を確認
```

デフォルトのリモートプロファイルストアに戻す：

```bash
airc remote owner maru3460
airc remote name airc_profiles
airc remote branch main
```

**エラー: "Profile not found in repository"**

リモートリポジトリに該当のプロファイルが存在するか確認：

```bash
airc remote --list
```

**ネットワークエラー**

インターネット接続を確認してください。GitHub のステータスページ（https://www.githubstatus.com/）も確認できます。

### .airc ディレクトリが壊れた場合

`.airc/` の内部状態が壊れた場合は、再初期化が必要です：

```bash
# 1. 現在の実ファイルをバックアップ（重要！）
cp -r .claude/ .claude_backup/
cp CLAUDE.md CLAUDE.md.backup

# 2. .airc を削除
rm -rf .airc/

# 3. 再初期化
airc init
```

### プロファイルが壊れた場合

特定のプロファイルが壊れている場合：

**対処法1: プロファイルを削除して作り直す**

```bash
airc delete broken-profile
airc new new-profile
```

**対処法2: リモートから再ダウンロード**

リモートプロファイルストアにバックアップがある場合：

```bash
airc delete broken-profile
airc remote <profile>
```

### プロファイル切り替え時のファイル競合

複数のプロファイルで異なる内容のファイルを管理している場合、切り替え時にファイルが上書きされます。

これは正常な動作です。プロファイル切り替え前の内容は、切り替え元のプロファイルに自動保存されています。

元のプロファイルに戻せば、以前の内容が復元されます：

```bash
airc use previous-profile  # 元の内容が復元される
```

### .sync 変更後にファイルが残っている

`.sync` からパターンを削除しても、既に展開されているファイルは自動削除されません。

手動で削除してください：

```bash
airc clear  # .sync のパターンに一致しないファイルを削除
```

詳細: [docs/configuration.md](configuration.md#sync-変更時の重要な注意点)

## コマンドエラー

### "Profile already exists"

同じ名前のプロファイルが既に存在します。

```bash
airc list  # 既存のプロファイルを確認
```

対処法：
- 別の名前を使う
- 既存のプロファイルを削除してから作成する

### "Profile not found"

指定したプロファイルが存在しません。

```bash
airc list  # 利用可能なプロファイルを確認
```

### "Cannot delete active profile"

アクティブなプロファイルは削除できません。

先に別のプロファイルに切り替えてください：

```bash
airc use another-profile
airc delete old-profile
```

### --force オプションについて

多くのコマンドで `--force` オプションが使えます：

| コマンド | --force の効果 |
|---------|---------------|
| `airc init --force` | 既存の設定を検証・修復 |
| `airc clear --force` | 確認なしでファイルを削除 |
| `airc restore <name> --force` | 確認なしでファイルを上書き |
| `airc remote <name> --force` | 確認なしでリモートプロファイルを上書き |

`--force` を使う場合は、データ損失の可能性があるため注意してください。

## リモートプロファイル

### カスタムリモートプロファイルストアの作成方法

自分やチームのリモートプロファイルストアを作成できます：

1. GitHubに新しいリポジトリを作成
2. `.airc/profiles/<profile-name>/` というディレクトリ構造でプロファイルを配置
3. aircの設定を変更：

```bash
airc remote owner <your-github-username>
airc remote name <your-repo-name>
```

リポジトリの構造例：

```
your-repo/
└── .airc/
    └── profiles/
        ├── standard/
        │   ├── .claude/
        │   └── CLAUDE.md
        └── experimental/
            ├── .claude/
            └── CLAUDE.md
```

### リモートプロファイルストアのブランチ切り替え

デフォルトでは `main` ブランチが使われますが、変更できます：

```bash
airc remote branch develop  # developブランチに切り替え
airc remote --list           # developブランチのプロファイル一覧を表示
```

これにより、開発版の設定と本番版の設定を分けて管理できます。

### プライベートリポジトリからダウンロードできない

**エラー: "リソースへのアクセス権限がありません"**

プライベートリポジトリの場合は、GitHub Personal Access Tokenを設定する必要があります:

```bash
# トークンを設定
airc remote token ghp_xxxxxxxxxxxx
```

トークンは以下のスコープが必要です:
- `repo`: プライベートリポジトリへの完全アクセス

**トークンの確認:**

```bash
airc remote token  # 現在のトークンを表示（マスク済み）
```

**トークンの削除:**

```bash
airc remote token --remove
```

**エラー: "認証に失敗しました"**

トークンが無効または期限切れの可能性があります。新しいトークンを生成して設定してください。

## その他

### aircのバージョン確認

```bash
npm list -g @maru3460/airc
```

### aircのアップデート

```bash
npm update -g @maru3460/airc
```

### aircのアンインストール

```bash
npm uninstall -g @maru3460/airc
```

アンインストール前に、必要なプロファイルをバックアップすることを推奨します。

---

その他の質問がある場合は、[GitHubのIssue](https://github.com/maru3460/airc/issues)で報告してください。
