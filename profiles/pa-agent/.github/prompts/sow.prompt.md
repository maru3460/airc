---
agent: document
description: sowの作成
---

## 概要
与えられタスクのsowを作成する。

## mode
Actモード

## 手順
1. タスクの分析
2. SOWの作成

## 注意事項
- タスクを進めるための必要十分な情報を記述すること
- ソースコードの修正箇所はdiff表示にすること
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
- SOWの作成場所は`.github/tmp/`
