# create-cerberus

> Scaffold a multi-provider AI coding harness — one command, no install.

`create-cerberus` hands anyone a clean, multi-provider harness of skills (Matt Pocock's engineering + productivity workflow) that works in Claude Code, OpenCode, and Codex.

## Usage

```bash
npx github:Nardjo/cerberus mon-harness
```

Creates `mon-harness/`, then detects your installed tools and symlinks the skills into each one (nothing for tools you don't have). No questions, no `git init` — the folder is yours.

Pin a version with a tag: `npx github:Nardjo/cerberus#v0.1.0 mon-harness`.

### Updating an existing harness

The harness ships with an `update-harness` skill: ask your AI tool to "update my harness" (or invoke `/update-harness`) and it pulls the latest curated template from this repo, adds new skills, silently refreshes the ones you never touched, and shows a diff + asks before replacing anything you modified (your version is backed up to `.cerberus/backup/` first). `CLAUDE.md` / `AGENTS.md` are never touched, skills removed upstream are never deleted, and `setup.sh` re-runs at the end so new skills get symlinked. A `.cerberus/manifest.json` (written at scaffold time, bootstrapped on first update for older harnesses) tracks what shipped from the template.

## What you get

- Matt Pocock's 22-skill `engineering/` + `productivity/` workflow plus `caveman` (ultra-compressed comms), in the Agent Skills format
- A `SKILLS.md` catalog plus a `CLAUDE.md` / `AGENTS.md` ruleset, symlinked into your tools' global config (Claude Code, OpenCode, Codex). An existing global config is backed up to `.bak`, never overwritten.
- A `setup.sh` that wires it all in, conditional on the tools you have installed (re-run it after installing a new one)
- Yours to own and evolve. Updates are opt-in via the bundled `update-harness` skill and never overwrite your changes without asking.

## Why no sync engine

Claude Code, OpenCode, and Codex have converged on the same Agent Skills standard: a `<name>/SKILL.md` folder with `name` + `description` frontmatter. A skill is written once and symlinked into each tool — there is no per-provider generation step. See [docs/adr/0001](docs/adr/0001-no-sync-engine-agent-skills-symlinks.md).

## Repo layout

```
.
├── bin/        # CLI entry (create-cerberus)
├── src/        # scaffolder + linker
├── build/      # template builder (assembles skills from mattpocock/skills)
├── template/   # the scaffolded harness: skills/, SKILLS.md, CLAUDE.md, AGENTS.md, setup.sh
├── test/       # node:test suite
├── docs/adr/   # architecture decisions
└── CONTEXT.md  # domain glossary
```

## Development

```bash
npm test                 # node:test suite
npm run build:template   # refresh template/skills from mattpocock/skills
node bin/create-cerberus.js test-harness
```

## License

MIT
