#!/usr/bin/env bash
# Installs Cerberus git hooks into the target project.
# Usage: CERBERUS_DIR=/path/to/cerberus PROJECT_DIR=/path/to/project bash install-hooks.sh
# Or run from inside the Cerberus repo to install hooks there.

set -euo pipefail

CERBERUS_DIR="${CERBERUS_DIR:-$(git -C "$(dirname "$0")/.." rev-parse --show-toplevel 2>/dev/null || echo "")}"
PROJECT_DIR="${PROJECT_DIR:-$(pwd)}"

if [ -z "$CERBERUS_DIR" ]; then
  echo "Error: CERBERUS_DIR not set and could not be auto-detected."
  exit 1
fi

HOOKS_DIR="$PROJECT_DIR/.git/hooks"

if [ ! -d "$HOOKS_DIR" ]; then
  echo "Error: $PROJECT_DIR does not appear to be a git repository."
  exit 1
fi

# Write pre-commit hook
cat > "$HOOKS_DIR/pre-commit" << EOF
#!/usr/bin/env bash
# Cerberus: sync skills across providers before each commit
CERBERUS_DIR="$CERBERUS_DIR"
bash "\$CERBERUS_DIR/scripts/sync.sh"
git add claude/ opencode/ codex/ 2>/dev/null || true
EOF

chmod +x "$HOOKS_DIR/pre-commit"
echo "Installed pre-commit hook in $PROJECT_DIR"
