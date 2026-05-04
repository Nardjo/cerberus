#!/usr/bin/env bash
# Syncs skills across providers. Run via pre-commit hook or manually.
# Source of truth: claude/skills/ (markdown with YAML frontmatter)
# Targets: opencode.json (commands), codex/skills/ (markdown)

set -euo pipefail

REPO_ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel 2>/dev/null || cd "$(dirname "$0")/.." && pwd)"

python3 "$REPO_ROOT/scripts/sync.py" "$REPO_ROOT"
