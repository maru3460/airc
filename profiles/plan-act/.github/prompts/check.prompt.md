---
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

テストは`spec/`にある
apiは`spec/requests/`
api以外はテストがある場合のみ実行する
ただし、formやdecoratorなどapiでつくためのファイルはそれ自体のテストがあればそれを実行し、対象のapiのテストも実行する

### .ts, .tsx
- prettier
- lint

### .scss
- prettier
- stylelint

## example

### 変更ファイル
- app/controllers/user_controller.rb
- app/forms/user_form.rb
- app/webpacks/applications/users/index.tsx
- app/webpacks/applications/users/style.scss

### 実行コマンド
```shell
docker compose exec -e LANG=C.UTF-8 milkyway /bin/bash -l -c "bundle exec rubocop app/controllers/user_controller.rb app/forms/user_form.rb"
docker compose exec -e RAILS_ENV=test milkyway /bin/bash -l -c "bundle exec rspec spec/requests/work_allotment_spec.rb spec/forms/user_form_spec.rb" # (spec/forms/user_form_spec.rbは存在する場合のみ)
docker compose exec milkyway_webpack /bin/bash -l -c "yarn prettier --write app/webpacks/applications/users/index.tsx app/webpacks/applications/users/style.scss"
docker compose exec milkyway_webpack /bin/bash -l -c "yarn lint-with-todo --fix app/webpacks/applications/users/index.tsx"
docker compose exec milkyway_webpack /bin/bash -l -c "yarn stylelint --fix app/webpacks/applications/users/style.scss"
```

## 注意点

- 絶対パスでなく相対パスで指定する
- 勝手にコマンドをアレンジしない(ex. `yarn lint ...`, `... || true`等)
- **変更のないファイルはtestもlintもformatも実行しない**
- **指示にないことをしない**(ex. 変更を書き出す、手動で修正をする、コミットする等)
