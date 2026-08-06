# Claude Code (`tools/claude/`)

| Path | Live path | Notes |
|------|-----------|--------|
| `settings.json` | `~/.claude/settings.json` | Adopted on first `setup.sh` if present |
| `hooks/` | `~/.claude/hooks` | Whole-dir symlink |
| `agents/` | `~/.claude/agents` | Whole-dir symlink |

**Never tracked:** `~/.claude/settings.local.json` (secrets). Edit that file only under `~/.claude/`.

After editing files here, re-run `bash setup.sh` if a link is missing.
