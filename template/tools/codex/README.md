# Codex (`tools/codex/`)

| Path | Live path | Notes |
|------|-----------|--------|
| `hooks.json` | `~/.codex/hooks.json` | Adopted on first setup if present |
| `config.toml` | `~/.codex/config.toml` | Adopted if present — strip secrets before git commit |
| `agents/` | `~/.codex/agents` | Whole-dir symlink |
| `rules/` | `~/.codex/rules` | Whole-dir symlink |

**Never tracked:** `~/.codex/plugins/` (marketplace cache/staging, often hundreds of MB). Auth and other secrets should stay out of `config.toml` if you version the harness.

Skills: `skills/` → `~/.agents/skills/`. Rules file (global): root `AGENTS.md` → `~/.codex/AGENTS.md`.
