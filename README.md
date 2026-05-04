# Cerberus

> Multi-provider AI coding workflow — works with Claude Code, OpenCode, and Codex.

Fork this repo to get a battle-tested AI workflow with skills that sync automatically across all providers.

## What's inside

- **24 skills** covering TDD, issue triage, architecture, code review, and more
- **Multi-provider sync** — write a skill once, it appears in Claude Code, OpenCode, and Codex
- **`/setup-project`** — one command to configure workflow tooling in any project
- **Sandcastle support** — run agents in isolated Docker sandboxes

Skills include Matt Pocock's engineering workflow ([mattpocock/skills](https://github.com/mattpocock/skills)) plus additional productivity and planning skills.

## Install

```bash
git clone https://github.com/Nardjo/cerberus
cd cerberus
./setup.sh
```

This symlinks all skills, commands, and agents into `~/.claude/` and installs the git sync hook.

## Use in a project

Open any project in your AI coding tool and run:

```
/setup-project
```

This will:
1. Install git hooks for skill sync
2. Configure issue tracker, triage labels, and domain docs
3. Optionally set up Sandcastle for isolated agent runs

## Sync skills across providers

Skills live in `claude/skills/`. The pre-commit hook automatically syncs them to:
- `opencode.json` commands (for OpenCode)
- `codex/skills/` (for Codex)

To sync manually without committing:
```bash
./scripts/sync.sh
```

## Add your own skills

1. Create `claude/skills/my-skill/skill.md` with YAML frontmatter (`name`, `description`)
2. Commit — the hook syncs it to all providers automatically

## Structure

```
cerberus/
├── claude/
│   ├── skills/       # Source of truth for all skills
│   ├── commands/     # Slash commands
│   └── agents/       # Subagent definitions
├── opencode/         # Generated from claude/skills/ by sync
├── codex/            # Generated from claude/skills/ by sync
├── scripts/
│   ├── sync.sh           # Multi-provider skill sync
│   └── install-hooks.sh  # Git hook installer
└── setup.sh          # One-time install
```

## License

MIT
