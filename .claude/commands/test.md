---
description: Test airc in a clean environment
allowed-tools: Bash(npm run build, rm, cp, npx)
---

# Test Command

このコマンドは、airc の動作をクリーンな環境でテストします。

## 使い方

```bash
/test
```

## 実行される処理

1. **ビルド**: `/home/maru/tmp/airc` で `npm run build` を実行
2. **テストディレクトリのクリーンアップ**: `~/tmp/airc_test` のファイルを全削除（ディレクトリは残す）
3. **動作テスト**: `~/tmp/airc_test` に移動して airc を実行

---

## 実行内容

以下の処理を順番に実行してください:

### 1. ビルド

```bash
cd /home/maru/tmp/airc && npm run build
```

ビルドが成功したら次に進む。失敗したらエラーを表示して中断。

### 2. テストディレクトリのクリーンアップ

```bash
rm -rf ~/tmp/airc_test/* ~/tmp/airc_test/.*
```

※ `airc_test` ディレクトリ自体は削除せず、中身だけを削除

ディレクトリが存在しない場合は作成:

```bash
mkdir -p ~/tmp/airc_test
```

### 3. 動作テスト

テストディレクトリに移動:

```bash
cd ~/tmp/airc_test
```

デフォルトプロファイルで airc を実行:

```bash
npx /home/maru/tmp/airc
```

成功したら、以下のテストも実行:

```bash
# プロファイル指定テスト
npx /home/maru/tmp/airc -p default

# 強制上書きテスト
npx /home/maru/tmp/airc --force
```

### 4. 結果確認

ダウンロードされたファイルを確認:

```bash
ls -la ~/tmp/airc_test
```

`.claude/` や `.github/` などが正しくダウンロードされていれば成功です。

---

全て成功したら、「✨ テスト完了！airc が正常に動作しています 🍛」と表示してください。

エラーが発生した場合は、どの段階で失敗したか明確に表示してください。
