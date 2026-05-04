#!/bin/bash

# Post-edit hook: lint + typecheck after editing JS/TS/Vue files
# Auto-detects package manager (bun > pnpm > npm)

CWD=$(pwd)

# Skip non-JS projects and .claude directory
if [ ! -f "$CWD/package.json" ]; then exit 0; fi
if [[ "$CWD" == *"/.claude"* ]]; then exit 0; fi
if [ ! -d "$CWD/node_modules" ] && [ ! -f "$CWD/tsconfig.json" ]; then exit 0; fi

# Read edited file path from stdin (Claude hook JSON)
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path":"[^"]*"' | head -1 | cut -d'"' -f4)

# If we got a file path, check extension
if [ -n "$FILE_PATH" ]; then
    case "$FILE_PATH" in
        *.vue|*.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs) ;;
        *) exit 0 ;;
    esac
fi

# Detect package manager: bun > pnpm > npm
detect_pm() {
    if [ -f "$CWD/bun.lockb" ] || [ -f "$CWD/bun.lock" ]; then
        command -v bun &>/dev/null && echo "bun" && return
    fi
    if [ -f "$CWD/pnpm-lock.yaml" ]; then
        command -v pnpm &>/dev/null && echo "pnpm" && return
    fi
    if [ -f "$CWD/package-lock.json" ]; then
        command -v npm &>/dev/null && echo "npm" && return
    fi
    # Fallback: first available
    command -v bun &>/dev/null && echo "bun" && return
    command -v pnpm &>/dev/null && echo "pnpm" && return
    command -v npm &>/dev/null && echo "npm" && return
    echo ""
}

PM=$(detect_pm)
if [ -z "$PM" ]; then exit 0; fi

# Check for linters and TypeScript
HAS_ESLINT=$(grep -qE '"eslint":|"@eslint/' "$CWD/package.json" 2>/dev/null && echo 1)
HAS_BIOME=$(grep -qE '"@biomejs/biome"' "$CWD/package.json" 2>/dev/null && echo 1)
HAS_TYPESCRIPT=$(grep -qE '"typescript"' "$CWD/package.json" 2>/dev/null && echo 1)
HAS_LINT_SCRIPT=$(grep -qE '"lint"' "$CWD/package.json" 2>/dev/null && echo 1)
HAS_TYPECHECK_SCRIPT=$(grep -qE '"typecheck"' "$CWD/package.json" 2>/dev/null && echo 1)

# Run lint
if [ "$HAS_LINT_SCRIPT" = "1" ] && { [ "$HAS_ESLINT" = "1" ] || [ "$HAS_BIOME" = "1" ]; }; then
    echo "[$PM] Running lint..."
    cd "$CWD" && $PM lint 2>&1 | head -30
fi

# Run typecheck (vue-tsc or tsc)
if [ "$HAS_TYPESCRIPT" = "1" ] && [ "$HAS_TYPECHECK_SCRIPT" = "1" ]; then
    echo "[$PM] Running typecheck..."
    cd "$CWD" && $PM typecheck 2>&1 | head -20
fi
