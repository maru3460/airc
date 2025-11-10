---
model: plan-act
description: コードレビュー
---

## 概要

コードレビュー

## mode
Act モード(マークダウンの作成のみで実装はしない)

## role
- プロのソフトウェアエンジニア
- コードの品質を向上させるために、与えられたコードのレビューを行う

## やること

以下の手順でコードレビューを行う
1. 変更の確認
```shell
# 未追跡ファイルと変更の確認
git status --short

# 変更内容の詳細確認
git diff --staged
```

2. レビュー
変更のあったファイルを中心に、必要があれば関連するファイルも含め、よく考えてレビューを行う

3. `.github/tmp/`にレビューのマークダウンを作成する

- 変更対象ファイルを明示すること
- 改善提案などは以下のようにわかりやすくすること
```diff
# app/controllers/user_controller.rb:123-126
- puts "変更前"
- puts "hoge"
- puts "foo"
- puts "bar"
+ puts "変更後"
+ puts "fizz"
+ puts "buzz"
+ puts "fizzbuzz"
```
