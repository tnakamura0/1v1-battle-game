#!/bin/bash
# git checkout -b / git switch -c のブランチ名を規約に照らしてチェックする PreToolUse フック
# 規約: <type>/<issue番号>-<短い説明>  例: feat/123-add-login-button

COMMAND=$(jq -r '.tool_input.command // empty')

if echo "$COMMAND" | grep -qE 'git (checkout -b|switch -c)'; then
  BRANCH_NAME=$(echo "$COMMAND" | grep -oE '(checkout -b|switch -c) +[^ ]+' | awk '{print $NF}')
  WORK_PATTERN='^(feat|fix|chore|refactor|docs|test|style|perf)/[0-9]+-[a-z0-9-]+$'
  RELEASE_PATTERN='^release/v[0-9]+\.[0-9]+\.[0-9]+$'

  if [[ -n "$BRANCH_NAME" ]] && ! [[ "$BRANCH_NAME" =~ $WORK_PATTERN ]] && ! [[ "$BRANCH_NAME" =~ $RELEASE_PATTERN ]]; then
    jq -n --arg name "$BRANCH_NAME" '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: ("ブランチ名 \"" + $name + "\" が規約に一致していません。作業ブランチは <type>/<issue番号>-<短い説明> (例: feat/123-add-login-button)、リリースブランチは release/vX.Y.Z (例: release/v1.2.0) の形式にしてください。type は feat/fix/chore/refactor/docs/test/style/perf のいずれかにしてください。")
      }
    }'
    exit 0
  fi
fi

exit 0
