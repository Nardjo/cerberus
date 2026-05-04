#!/usr/bin/env bash
# Cerberus setup — symlinks skills/commands into ~/.claude/ and installs git hooks.

set -euo pipefail

CERBERUS_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"

echo "Setting up Cerberus from $CERBERUS_DIR"

# ── Skills ──────────────────────────────────────────────────────────────────

mkdir -p "$CLAUDE_DIR/skills"

for skill_dir in "$CERBERUS_DIR/claude/skills"/*/; do
  skill_name="$(basename "$skill_dir")"
  target="$CLAUDE_DIR/skills/$skill_name"

  if [ -L "$target" ]; then
    rm "$target"
  fi

  ln -s "$skill_dir" "$target"
  echo "  linked skill: $skill_name"
done

# ── Commands ─────────────────────────────────────────────────────────────────

mkdir -p "$CLAUDE_DIR/commands"

for cmd_file in "$CERBERUS_DIR/claude/commands"/*.md; do
  [ -f "$cmd_file" ] || continue
  cmd_name="$(basename "$cmd_file")"
  target="$CLAUDE_DIR/commands/$cmd_name"

  if [ -L "$target" ]; then
    rm "$target"
  fi

  ln -s "$cmd_file" "$target"
  echo "  linked command: $cmd_name"
done

# ── Agents ───────────────────────────────────────────────────────────────────

mkdir -p "$CLAUDE_DIR/agents"

for agent_file in "$CERBERUS_DIR/claude/agents"/*.md; do
  [ -f "$agent_file" ] || continue
  agent_name="$(basename "$agent_file")"
  target="$CLAUDE_DIR/agents/$agent_name"

  if [ -L "$target" ]; then
    rm "$target"
  fi

  ln -s "$agent_file" "$target"
  echo "  linked agent: $agent_name"
done

# ── Git hooks (for Cerberus repo itself) ────────────────────────────────────

PROJECT_DIR="$CERBERUS_DIR" bash "$CERBERUS_DIR/scripts/install-hooks.sh"

echo ""
echo "Cerberus is ready."
echo "Run /setup-project in any project to configure Cerberus workflow tooling."
