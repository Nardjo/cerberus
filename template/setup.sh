#!/usr/bin/env bash
# Link this harness's skills into every installed AI coding tool.
# Re-run any time (after installing a new tool, for example). Idempotent.

set -euo pipefail

HARNESS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$HARNESS_DIR/skills"

link_skills_into() {
  local dest="$1"
  mkdir -p "$dest"
  for skill_dir in "$SKILLS_DIR"/*/; do
    [ -d "$skill_dir" ] || continue
    local name target
    name="$(basename "$skill_dir")"
    target="$dest/$name"
    [ -L "$target" ] && rm "$target"
    ln -s "${skill_dir%/}" "$target"
  done
}

linked=()

if [ -d "$HOME/.claude" ]; then
  link_skills_into "$HOME/.claude/skills"
  linked+=("Claude Code")
fi

if [ -d "$HOME/.config/opencode" ]; then
  link_skills_into "$HOME/.config/opencode/skills"
  linked+=("OpenCode")
fi

if [ -d "$HOME/.codex" ]; then
  link_skills_into "$HOME/.agents/skills"
  linked+=("Codex")
fi

if [ ${#linked[@]} -eq 0 ]; then
  echo "Aucun outil détecté (Claude Code, OpenCode, Codex). Skills non liés."
  echo "Installe un outil puis relance : bash setup.sh"
else
  echo "Skills liés à : ${linked[*]}"
fi
