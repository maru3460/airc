---
description: Build, version bump, and publish to npm
argument-hint: <patch|minor|major>
allowed-tools: Bash(npm run build, npm version, git push, npm publish)
---

# Publish Command

このコマンドは、npm パッケージの更新フローを自動化します。

## 使い方

```bash
/publish patch   # パッチバージョンを上げる (0.0.1 → 0.0.2)
/publish minor   # マイナーバージョンを上げる (0.0.1 → 0.1.0)
/publish major   # メジャーバージョンを上げる (0.0.1 → 1.0.0)
```

## 実行される処理

1. **ビルド**: `npm run build` を実行してTypeScriptをコンパイル
2. **バージョン更新**: `npm version $ARGUMENTS` でバージョンを上げる
3. **Git プッシュ**: `git push && git push --tags` でコミットとタグをプッシュ
4. **npm 公開**: `npm publish --access public` でパッケージを公開

## 引数について

引数が指定されていない場合、または無効な値の場合は、使い方を表示します。

有効な引数:
- `patch`: バグ修正や小さな変更
- `minor`: 新機能追加（互換性あり）
- `major`: 破壊的変更

---

## 実行内容

$ARGUMENTSが空の場合、または patch/minor/major 以外の場合:

```
使い方を表示してください:

/publish <patch|minor|major>

- patch: パッチバージョンを上げる (例: 0.0.1 → 0.0.2) - バグ修正用
- minor: マイナーバージョンを上げる (例: 0.0.1 → 0.1.0) - 新機能追加用
- major: メジャーバージョンを上げる (例: 0.0.1 → 1.0.0) - 破壊的変更用

どのバージョンを上げたいですか？
```

$ARGUMENTSが patch, minor, major のいずれかの場合:

以下の処理を順番に実行してください:

1. まず、package.jsonを確認して現在のバージョンを表示
2. TypeScriptのビルドを実行: `npm run build`
3. バージョンを更新: `npm version $ARGUMENTS`
4. GitHubにプッシュ: `git push && git push --tags`
5. npmに公開: `npm publish --access public`

各ステップで:
- 成功したら次に進む
- 失敗したら、エラー内容を表示して処理を中断する

全て成功したら、「✨ 公開完了！ 新しいバージョンが npm に公開されました 🍛」と表示してください。
