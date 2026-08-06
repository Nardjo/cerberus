# Codex (`tools/codex/`)

| Path | Live path | Notes |
|------|-----------|--------|
| `hooks.json` | `~/.codex/hooks.json` | Adopted on first setup if present |

`~/.codex/config.toml` often holds secrets and is **not** auto-adopted. If you want a public config tracked in the harness, copy a sanitized version to `tools/codex/config.toml` and extend `setup.sh` to link it (or keep config local-only).

Skills: `skills/` → `~/.agents/skills/`. Rules: root `AGENTS.md` → `~/.codex/AGENTS.md`.
