#!/bin/bash
# gh pr create のタイトル・本文を規約に照らしてチェックする PreToolUse フック
#
# 注意: この判定はコマンド文字列に対する簡易パターンマッチです。
# --body-file でファイルを指定する運用にすると、より確実にチェックできます。

COMMAND=$(jq -r '.tool_input.command // empty')

if echo "$COMMAND" | grep -q 'gh pr create'; then
  TITLE_PATTERN='^(feat|fix|chore|refactor|docs|test|style|perf)(\([a-zA-Z0-9_-]+\))?: .+'

  # --title "..." の値を抽出（シングル/ダブルクォート対応の簡易版）
  TITLE=$(echo "$COMMAND" | grep -oE -- '--title[= ]"[^"]*"|--title[= ]'"'"'[^'"'"']*'"'"'' \
    | sed -E 's/--title[= ]//; s/^["'"'"']//; s/["'"'"']$//')

  REQUIRED_SECTIONS=("## 概要" "## 変更内容" "## 関連Issue" "## 影響範囲・破壊的変更" "## 動作確認手順" "## セルフレビューチェックリスト")
  MISSING=()

  for section in "${REQUIRED_SECTIONS[@]}"; do
    if ! echo "$COMMAND" | grep -qF "$section"; then
      MISSING+=("$section")
    fi
  done

  REASON=""

  if [[ -n "$TITLE" ]] && ! [[ "$TITLE" =~ $TITLE_PATTERN ]]; then
    REASON="PRタイトルがConventional Commits形式（例: feat: ログイン画面を追加）になっていません。"
  fi

  if ! echo "$COMMAND" | grep -qE 'Closes #[0-9]+'; then
    REASON="${REASON} 本文に \"Closes #<Issue番号>\" が含まれていません。"
  fi

  if [[ ${#MISSING[@]} -gt 0 ]]; then
    REASON="${REASON} 以下の必須セクションが不足しています: ${MISSING[*]}"
  fi

  if [[ -n "$REASON" ]]; then
    jq -n --arg reason "$REASON" '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: ($reason + " .github/pull_request_template.md のテンプレートに沿って書き直してください。")
      }
    }'
    exit 0
  fi
fi

exit 0
