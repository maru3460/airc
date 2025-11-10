---
mode: plan-act
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

1. レビュー対象の確認

2. レビュー
指定されたファイル・ディレクトリについて、よく考えてレビューをする

3. `.github/tmp/`にレビューのマークダウンを作成する

- 変更対象ファイルを明示すること
- コードの改善提案などは以下のようにわかりやすくすること
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
