# Gemini / Antigravity (`tools/gemini/`)

| Path | Live path | Notes |
|------|-----------|--------|
| `settings.json` | `~/.gemini/settings.json` | Adopted on first setup if present |
| `agents/` | `~/.gemini/agents` | Whole-dir symlink |
| `hooks/` | `~/.gemini/hooks` | Whole-dir symlink |

Rules: root `AGENTS.md` → `~/.gemini/GEMINI.md`. Skills and commands are shared at the harness root.

**Never tracked:** `oauth_creds.json`, `google_accounts.json`, and other auth files under `~/.gemini/`.
