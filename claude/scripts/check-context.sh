#!/bin/bash
# Stop hook: auto-runs half-clone when context usage exceeds 65%.

set -euo pipefail

THRESHOLD_PERCENT=65
CONTEXT_WINDOW=1000000
CLAUDE_DIR="${HOME}/.claude"
HISTORY_FILE="${CLAUDE_DIR}/history.jsonl"
HALF_CLONE_SCRIPT="${CLAUDE_DIR}/scripts/half-clone-conversation.sh"
STATE_DIR="${CLAUDE_DIR}/tmp/check-context"

emit_block() {
  jq -Rn --arg reason "$1" '{ decision: "block", reason: $reason }'
}

read_state_reason() {
  local state_file="$1"
  jq -r '.reason // empty' "$state_file" 2>/dev/null || true
}

write_state() {
  local state_file="$1"
  local reason="$2"
  local clone_tag="$3"
  local new_session="$4"

  jq -Rn \
    --arg reason "$reason" \
    --arg clone_tag "$clone_tag" \
    --arg new_session "$new_session" \
    '{ reason: $reason, clone_tag: $clone_tag, new_session: $new_session }' \
    > "$state_file"
}

mkdir -p "$STATE_DIR"

input=$(cat)

transcript_path=$(printf '%s' "$input" | jq -r '.transcript_path // empty')
session_id=$(printf '%s' "$input" | jq -r '.session_id // empty')
cwd=$(printf '%s' "$input" | jq -r '.cwd // empty')
stop_hook_active=$(printf '%s' "$input" | jq -r '.stop_hook_active // false')

# Avoid infinite loop: if we already fired once this stop cycle, let it through.
if [ "$stop_hook_active" = "true" ]; then
  exit 0
fi

if [ -z "$transcript_path" ] || [ ! -f "$transcript_path" ] || [ -z "$session_id" ]; then
  exit 0
fi

# Rough token estimate: total chars / 4 (typical English/code ratio).
char_count=$(wc -c < "$transcript_path" | tr -d ' ')
estimated_tokens=$(( char_count / 4 ))
usage_percent=$(( estimated_tokens * 100 / CONTEXT_WINDOW ))

if [ "$usage_percent" -lt "$THRESHOLD_PERCENT" ]; then
  exit 0
fi

state_file="${STATE_DIR}/${session_id}.json"
if [ -f "$state_file" ]; then
  cached_reason=$(read_state_reason "$state_file")
  if [ -n "$cached_reason" ]; then
    emit_block "$cached_reason"
    exit 0
  fi
fi

if [ ! -x "$HALF_CLONE_SCRIPT" ]; then
  reason="Context usage at ~${usage_percent}% (threshold ${THRESHOLD_PERCENT}%). Automatic half-clone could not run because ${HALF_CLONE_SCRIPT} is missing or not executable."
  write_state "$state_file" "$reason" "" ""
  emit_block "$reason"
  exit 0
fi

project_path=""
if [ -f "$HISTORY_FILE" ]; then
  project_path=$(jq -r --arg sid "$session_id" 'select(.sessionId == $sid) | .project // empty' "$HISTORY_FILE" | tail -n 1)
fi

if [ -z "$project_path" ]; then
  project_path="$cwd"
fi

if [ -z "$project_path" ]; then
  reason="Context usage at ~${usage_percent}% (threshold ${THRESHOLD_PERCENT}%). Automatic half-clone could not determine the project path for session ${session_id}."
  write_state "$state_file" "$reason" "" ""
  emit_block "$reason"
  exit 0
fi

if ! clone_output=$("$HALF_CLONE_SCRIPT" "$session_id" "$project_path" 2>&1); then
  clone_error=$(printf '%s\n' "$clone_output" | tail -n 8 | tr '\n' ' ' | sed 's/  */ /g')
  reason="Context usage at ~${usage_percent}% (threshold ${THRESHOLD_PERCENT}%). Automatic half-clone failed for session ${session_id}. ${clone_error}"
  write_state "$state_file" "$reason" "" ""
  emit_block "$reason"
  exit 0
fi

new_session=$(printf '%s\n' "$clone_output" | awk -F': *' '/^New session:/ {print $2}' | tail -n 1)
clone_tag=$(printf '%s\n' "$clone_output" | sed -n 's/^Then select the conversation marked with \(.*\)$/\1/p' | tail -n 1)

if [ -z "$clone_tag" ]; then
  clone_tag='[HALF-CLONE]'
fi

reason="Context usage at ~${usage_percent}% (threshold ${THRESHOLD_PERCENT}%). Automatic half-clone completed. Resume with 'claude -r' and pick ${clone_tag}. Claude hooks cannot clear or switch the current interactive session by themselves, so this session must still be closed or cleared manually after you switch."

write_state "$state_file" "$reason" "$clone_tag" "$new_session"
emit_block "$reason"
