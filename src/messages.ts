import { EMOJI } from "./emoji.js";

export const UNINITIALIZED_MESSAGE = `${EMOJI.ERROR} .airc/ がまだ初期化されていません。\n` +
  `\`airc init\` で初期化してください。`

export const INVALID_CONFIG_MESSAGE = `${EMOJI.ERROR} config.json が見つからないか、不正な形式です。\n` +
  `手動で修復するか、\`airc init -f\` を実行してください。(.syncに従い、現状のファイルで新しいプロファイルが作成されます)`

export const INVALID_SYNC_MESSAGE = `${EMOJI.ERROR} .sync が見つからないか、不正な形式です。\n` +
  `手動で修復するか、\`airc init -f\` を実行してください。(デフォルトの.syncが再生成されます)`

export const INVALID_CONFIG_CONTENT_MESSAGE = `${EMOJI.ERROR} config.json の内容が不正です。\n` +
  `以下のいずれかの修正を行ってください:\n` +
  `- 自動修復:\`airc init -f\`を実行する(現状のファイルで新しくプロファイルが作成されます)\n` +
  `- 手動修正:` +
  `  1. (任意)現在のファイルのバックアップを取る\n` +
  `  2. .airc/profiles/に存在する有効なプロファイル名を、current フィールドに設定する\n` +
  `  3. (任意)\`airc new <profile-name>\` で新しいプロファイルを作成し、バックアップを反映させる\n`

export const PROFILE_NAME_REQUIRED_MESSAGE = `${EMOJI.ERROR} プロファイル名を指定してください\n` +
  `使用例: airc remote <profile>\n` +
  `リモートプロファイル一覧: airc remote --list`

export function getProfileAlreadyExistsRemoteMessage(profile: string): string {
  return `${EMOJI.ERROR} プロファイル "${profile}" は既に存在します\n` +
    `${EMOJI.INFO} ローカルプロファイルの上書きを避けるため、ダウンロードをキャンセルしました\n` +
    `${EMOJI.INFO} このプロファイルを再ダウンロードしたい場合は、既存のプロファイルを削除またはリネームしてください:\n` +
    `  - airc delete ${profile}           # 削除\n` +
    `  - airc rename ${profile} <新しい名前>  # リネーム`;
}
