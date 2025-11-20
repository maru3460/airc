# airc

**airc** は、AIツール設定をプロファイルで管理・切り替えるCLIツールです。

## ⚡ クイックスタート

```bash
npm install -g @maru3460/airc
airc init  # 現在の設定を保存
```

## 🚀 使い方

### プロファイルを作成・切り替え

```bash
airc new experimental  # 新しいプロファイルを作成
airc use experimental  # プロファイルを切り替え
airc use default       # defaultに戻す
```

### プロファイル一覧

```bash
airc list  # 保存されているプロファイルを表示
```

### リモートプロファイルの利用

```bash
airc remote owner my-team          # GitHubリポジトリオーナーを設定
airc remote name team-ai-config    # リポジトリ名を設定
airc remote standard               # リモートからダウンロード
```

## 💡 ユースケース

### 設定を安全に試す

```bash
airc new experimental  # 実験用プロファイルを作成
airc use experimental  # 実験用プロファイルに切り替え
# .claude/ や CLAUDE.md を編集
airc use default       # 元に戻す
```

### チームで設定を統一

```bash
airc remote owner my-team
airc remote name team-config
airc remote standard   # チーム標準設定をダウンロード
airc use standard      # 標準設定に切り替え
```

## 📖 CLI Options

### 基本コマンド

| コマンド | 説明 |
|---------|------|
| `airc init` | 現在の設定をdefaultプロファイルとして保存 |
| `airc list` | プロファイル一覧を表示 |
| `airc new <name>` | 新しいプロファイルを作成 |
| `airc use <name>` | プロファイルを切り替え |

### 管理コマンド

| コマンド | 説明 |
|---------|------|
| `airc rename <old> <new>` | プロファイル名を変更 |
| `airc delete <name>` | プロファイルを削除 |
| `airc clear` | 現在のファイルを削除（プロファイルは保持） |
| `airc restore <name>` | プロファイルから復元 |

### リモート連携

| コマンド | 説明 |
|---------|------|
| `airc remote owner <owner>` | GitHubリポジトリオーナーを設定 |
| `airc remote name <repo>` | リポジトリ名を設定 |
| `airc remote <profile>` | リモートからプロファイルをダウンロード |

詳細: [docs/commands.md](docs/commands.md)

## 🔧 Troubleshooting

**プロファイル切り替えが反映されない**
- `.airc/config.json` でアクティブなプロファイルを確認
- `.airc/.sync` の設定を確認

**リモートダウンロードが失敗する**
- `airc remote owner` と `airc remote name` の設定を確認
- リポジトリに `.airc/profiles/<profile>/` が存在するか確認

## 📋 Requirements

- Node.js >= 18.0.0

## 📄 License

MIT
