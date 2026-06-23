#!/usr/bin/env bash
# Wire this harness into every installed AI coding tool, in two passes:
#   1. ADOPT  — pull the coaché's existing personal skills/commands/agents/config
#               into this harness, so the scaffolded folder becomes the single
#               source of truth. Nothing is lost.
#   2. LINK   — symlink the harness back into each tool.
# Re-run any time (after installing a new tool, for example). Idempotent: once a
# tool's entry is a symlink it is left alone, so a second run is a no-op.
# A personal config file (CLAUDE.md / AGENTS.md) is appended into the harness
# config under a dedicated section, then backed up to <file>.bak before linking.

set -euo pipefail

HARNESS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- helpers ---------------------------------------------------------------

# Pick a non-colliding destination path inside $harness_dir for $name.
# On collision the adopted entry is suffixed with -local (keeping both):
#   dir   tdd      -> tdd-local, tdd-local2, ...
#   file  ship.md  -> ship-local.md  (suffix inserted before the extension)
dest_path() {
  local harness_dir="$1" name="$2" is_dir="$3"
  if [ ! -e "$harness_dir/$name" ]; then
    printf '%s' "$harness_dir/$name"
    return
  fi
  local stem ext
  if [ "$is_dir" = "1" ] || [[ "$name" != *.* ]]; then
    stem="$name"; ext=""
  else
    stem="${name%.*}"; ext=".${name##*.}"
  fi
  local n=1 candidate="$harness_dir/${stem}-local${ext}"
  while [ -e "$candidate" ]; do
    n=$((n + 1))
    candidate="$harness_dir/${stem}-local${n}${ext}"
  done
  printf '%s' "$candidate"
}

# Move every real (non-symlink) entry of $tool_dir into $harness_dir.
# Symlinks are skipped — they are already managed (by us or another tool).
adopt_dir() {
  local tool_dir="$1" harness_dir="$2"
  [ -d "$tool_dir" ] || return 0
  if [ -L "$tool_dir" ]; then return 0; fi
  local entry name is_dir target
  for entry in "$tool_dir"/*; do
    [ -e "$entry" ] || continue
    if [ -L "$entry" ]; then continue; fi
    is_dir=0
    if [ -d "$entry" ]; then is_dir=1; fi
    name="$(basename "$entry")"
    mkdir -p "$harness_dir"
    target="$(dest_path "$harness_dir" "$name" "$is_dir")"
    mv "$entry" "$target"
    echo "  adopté ($(basename "$harness_dir")): $name → $(basename "$target")"
  done
}

# Append a tool's personal config into the harness config, then back it up.
# Skips a config that is already a symlink (re-run) or has already been imported.
adopt_config() {
  local tool_cfg="$1" harness_cfg="$2" provider="$3"
  [ -e "$tool_cfg" ] || return 0
  if [ -L "$tool_cfg" ]; then return 0; fi
  [ -f "$harness_cfg" ] || return 0
  local marker="<!-- cerberus:imported:$provider -->"
  if ! grep -qF "$marker" "$harness_cfg"; then
    {
      printf '\n\n%s\n' "$marker"
      printf '## Config importée (%s)\n\n' "$provider"
      cat "$tool_cfg"
    } >> "$harness_cfg"
    echo "  config importée ($provider) → $(basename "$harness_cfg")"
  fi
  mv "$tool_cfg" "$tool_cfg.bak"
  echo "  sauvegarde: $(basename "$tool_cfg") → $(basename "$tool_cfg").bak"
}

# Symlink every entry of $src_dir into $dest. No-op if $src_dir is empty/absent.
# Used for skills: $dest stays a real dir holding one symlink per skill.
link_dir() {
  local src_dir="$1" dest="$2"
  [ -d "$src_dir" ] || return 0
  local entry name target
  for entry in "$src_dir"/*; do
    [ -e "$entry" ] || continue
    mkdir -p "$dest"
    name="$(basename "$entry")"
    target="$dest/$name"
    if [ -L "$target" ]; then rm "$target"; fi
    ln -s "$entry" "$target"
  done
}

# Symlink $src_dir itself as $dest (whole-dir link). No-op if $src_dir is empty/absent.
# Used for commands/agents: $dest becomes a single symlink to the harness dir, so new
# entries appear automatically. An existing real $dest is emptied by adoption first,
# then removed; a non-empty leftover is backed up to $dest.bak.
link_tree() {
  local src_dir="$1" dest="$2"
  [ -d "$src_dir" ] || return 0
  if [ -z "$(ls -A "$src_dir" 2>/dev/null)" ]; then return 0; fi
  mkdir -p "$(dirname "$dest")"
  if [ -L "$dest" ]; then
    rm "$dest"
  elif [ -d "$dest" ]; then
    rmdir "$dest" 2>/dev/null || { mv "$dest" "$dest.bak"; echo "  sauvegarde: $(basename "$dest")/ → $(basename "$dest").bak"; }
  elif [ -e "$dest" ]; then
    mv "$dest" "$dest.bak"
  fi
  ln -s "$src_dir" "$dest"
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

# --- pass 1: adopt the coaché's existing content into the harness ----------

if [ -d "$HOME/.claude" ]; then
  adopt_dir    "$HOME/.claude/skills"   "$HARNESS_DIR/skills"
  adopt_dir    "$HOME/.claude/commands" "$HARNESS_DIR/commands/claude"
  adopt_dir    "$HOME/.claude/agents"   "$HARNESS_DIR/agents/claude"
  adopt_config "$HOME/.claude/CLAUDE.md" "$HARNESS_DIR/CLAUDE.md" "Claude Code"
fi

if [ -d "$HOME/.config/opencode" ]; then
  adopt_dir    "$HOME/.config/opencode/skills"   "$HARNESS_DIR/skills"
  adopt_dir    "$HOME/.config/opencode/commands" "$HARNESS_DIR/commands/opencode"
  adopt_dir    "$HOME/.config/opencode/agents"   "$HARNESS_DIR/agents/opencode"
  adopt_config "$HOME/.config/opencode/AGENTS.md" "$HARNESS_DIR/AGENTS.md" "OpenCode"
fi

if [ -d "$HOME/.codex" ]; then
  adopt_dir    "$HOME/.agents/skills" "$HARNESS_DIR/skills"
  adopt_config "$HOME/.codex/AGENTS.md" "$HARNESS_DIR/AGENTS.md" "Codex"
fi

# --- pass 2: link the harness into every installed tool --------------------

linked=()

if [ -d "$HOME/.claude" ]; then
  link_dir    "$HARNESS_DIR/skills"          "$HOME/.claude/skills"
  link_tree   "$HARNESS_DIR/commands/claude" "$HOME/.claude/commands"
  link_tree   "$HARNESS_DIR/agents/claude"   "$HOME/.claude/agents"
  link_config "$HARNESS_DIR/CLAUDE.md" "$HOME/.claude/CLAUDE.md"
  linked+=("Claude Code")
fi

if [ -d "$HOME/.config/opencode" ]; then
  link_dir    "$HARNESS_DIR/skills"            "$HOME/.config/opencode/skills"
  link_tree   "$HARNESS_DIR/commands/opencode" "$HOME/.config/opencode/commands"
  link_tree   "$HARNESS_DIR/agents/opencode"   "$HOME/.config/opencode/agents"
  link_config "$HARNESS_DIR/AGENTS.md" "$HOME/.config/opencode/AGENTS.md"
  linked+=("OpenCode")
fi

if [ -d "$HOME/.codex" ]; then
  link_dir    "$HARNESS_DIR/skills" "$HOME/.agents/skills"
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
