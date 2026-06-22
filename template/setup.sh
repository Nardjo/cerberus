#!/usr/bin/env bash
# Link this harness's skills and global config into every installed AI coding tool.
# Re-run any time (after installing a new tool, for example). Idempotent.
# An existing global config file is backed up to <file>.bak before linking — never overwritten.

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

link_config() {
  local src="$1" dest="$2"
  [ -f "$src" ] || return 0
  mkdir -p "$(dirname "$dest")"
  if [ -L "$dest" ]; then
    rm "$dest"
  elif [ -e "$dest" ]; then
    mv "$dest" "$dest.bak"
    echo "  sauvegarde: $(basename "$dest") → $(basename "$dest").bak"
  fi
  ln -s "$src" "$dest"
}

linked=()

if [ -d "$HOME/.claude" ]; then
  link_skills_into "$HOME/.claude/skills"
  link_config "$HARNESS_DIR/CLAUDE.md" "$HOME/.claude/CLAUDE.md"
  linked+=("Claude Code")
fi

if [ -d "$HOME/.config/opencode" ]; then
  link_skills_into "$HOME/.config/opencode/skills"
  link_config "$HARNESS_DIR/AGENTS.md" "$HOME/.config/opencode/AGENTS.md"
  linked+=("OpenCode")
fi

if [ -d "$HOME/.codex" ]; then
  link_skills_into "$HOME/.agents/skills"
  link_config "$HARNESS_DIR/AGENTS.md" "$HOME/.codex/AGENTS.md"
  linked+=("Codex")
fi

if [ ${#linked[@]} -eq 0 ]; then
  echo "Aucun outil détecté (Claude Code, OpenCode, Codex). Rien lié."
  echo "Installe un outil puis relance : bash setup.sh"
else
  echo "Skills + config liés à : ${linked[*]}"
fi

# rtk (Rust Token Killer) — set up token-saving hooks if it's installed.
if [ "${CC_SKIP_RTK:-}" != "1" ] && command -v rtk >/dev/null 2>&1; then
  if [ -d "$HOME/.config/opencode" ]; then
    rtk init -g --opencode >/dev/null 2>&1 || true
  else
    rtk init -g >/dev/null 2>&1 || true
  fi
  echo "rtk initialisé (token savings)"
fi
