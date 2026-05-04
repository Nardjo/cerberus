# Cerberus

Multi-provider AI coding workflow for Claude Code, OpenCode, and Codex.

## Language

- Respond in the user's language
- Code comments in English
- Commit messages in English: `feat:`, `fix:`, `update:`, `refactor:`, `docs:`, `chore:`

## Git

- Never add AI attribution to commits (`Co-Authored-By`, `Generated with`, etc.)
- One-line commit messages, max 50 chars
- Never use `--no-verify` or skip hooks

## File deletion

- Use `trash` instead of `rm -rf` when available
- Path: `/opt/homebrew/opt/trash/bin/trash`

## Code quality

- Simplicity first: minimal impact, no over-engineering
- No temporary fixes — find root causes
- No comments explaining what code does; only comment non-obvious WHY

## Workflow

- Plan before implementing non-trivial tasks
- Use subagents for research and parallel work
- Verify before marking tasks done

## Skills

Skills are in `claude/skills/`. Run `/setup-project` in any project to configure workflow tooling.
