---
agent: cact
model: GPT-4.1 (copilot)
tools: ['search', 'runCommands', 'problems', 'testFailure', 'todos']
description: lint, format, test
---

## 概要
`git status`で変更されたファイルを確認し、過不足なくファイルを指定してlint, format, testを実行する

## モード
Actモード

## 手順
1. `git status --short`を実行し、変更されたファイルを確認する
2. 変更されたファイル(ステージング)の拡張子に応じて、適切なコマンドを実行する

## テスト対象

### .rb
- rubocop
- rspec

テストの場所は`/spec/`

### .ts, .tsx
- prettier
- lint

## example

### 変更ファイル
- 変更ファイル１
- 変更ファイル２

### 実行コマンド
```shell
こまんど例
```

## 注意点

- 絶対パスでなく相対パスで指定する
- 勝手にコマンドをアレンジしない(ex. `yarn lint ...`, `... || true`等)
- **変更のないファイルはtestもlintもformatも実行しない**
- **指示にないことをしない**(ex. 変更を書き出す、手動で修正をする、コミットする等)
