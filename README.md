# create-cerberus

<video src="public/cerberus.mp4" autoplay loop muted playsinline width="100%"></video>

> Scaffold a multi-provider AI coding harness — one command, no install.

`create-cerberus` hands anyone a clean, multi-provider harness of skills (Matt Pocock's engineering + productivity workflow) that works in Claude Code, OpenCode, Codex, Antigravity, and Grok.

## Usage

```bash
npx  github:Nardjo/cerberus mon-harness  # npm
pnpm dlx github:Nardjo/cerberus mon-harness
yarn dlx github:Nardjo/cerberus mon-harness
bunx github:Nardjo/cerberus mon-harness
```

Creates `mon-harness/`, then detects your installed tools, **adopts** any existing settings/hooks/plugins/commands into the harness (`tools/<provider>/`, shared `commands/`), and **symlinks** everything back (nothing for tools you don't have). Secrets stay local (`settings.local.json`, auth files). No questions, no `git init` — the folder is yours.

Pin a version with a tag: `npx github:Nardjo/cerberus#v0.3.0 mon-harness`.

### Updating an existing harness

```bash
npx github:Nardjo/cerberus update mon-harness
npx github:Nardjo/cerberus update --check mon-harness   # dry-run
npx github:Nardjo/cerberus update                       # cwd or auto-detect via tool symlinks
npx github:Nardjo/cerberus update mon-harness --take skills/tdd  # force upstream on a conflict
```

`npx` always fetches this repo, so `update` applies the current curated `template/` onto your harness: new skills are added, untouched skills that changed upstream are refreshed silently, and anything you modified is shown as a conflict (diff + prompt; your copy is backed up under `.cerberus/backup/` if you take upstream). `CLAUDE.md` / `AGENTS.md` are never touched, skills removed upstream are never deleted, and `setup.sh` re-runs at the end so new skills get symlinked. A `.cerberus/manifest.json` (written at scaffold time, bootstrapped on first update for older harnesses) tracks what shipped from the template.

#### Already installed an older harness?

Layout changed (`tools/`, shared `commands/`). Do **not** re-scaffold into a new folder — reinstall in place:

```bash
npx github:Nardjo/cerberus reinstall mon-harness
# or from the harness directory / via tool symlinks:
npx github:Nardjo/cerberus reinstall
```

That migrates `commands/<outil>/` and `agents/<outil>/` into the new structure, keeps your skills and personal files, refreshes `setup.sh` + curated skills, then re-runs `setup.sh` so live settings/hooks/plugins are adopted into `tools/`. Alias: `upgrade`.

From an AI tool, invoke the bundled **`update-harness`** skill: it is the step-by-step procedure that runs this same CLI (not a Matt Pocock upstream sync). Design rationale: [docs/adr/0002](docs/adr/0002-harness-update-cli-and-manifest.md).

## What you get

- Matt Pocock's curated `engineering/` + `productivity/` workflow (25 skills) plus Cerberus skills (`caveman`, `update-harness`, `empty-trash`), in the Agent Skills format
- Shared `skills/` + `commands/`, plus per-provider `tools/<provider>/` (settings, hooks, plugins, agents) — same layout idea as a personal hub
- A `SKILLS.md` catalog plus a `CLAUDE.md` / `AGENTS.md` ruleset, symlinked into your tools' global config (Claude Code, OpenCode, Codex, Antigravity, Grok). Existing configs are adopted into the harness then linked; nothing is overwritten without a `.bak`
- **RTK** (Rust Token Killer): `setup.sh` installs the binary if missing (`brew install rtk` or curl), ships `RTK.md`, links it into tool homes, and runs `rtk init` for Claude/OpenCode hooks
- **trash**: `setup.sh` installs Homebrew `trash` if missing; harness rules forbid `rm` so agent deletes go to the macOS Trash (recoverable)
- A `setup.sh` that wires it all in, conditional on the tools you have installed (re-run it after installing a new one)
- Yours to own and evolve. Updates are opt-in via `create-cerberus update` (or the bundled `update-harness` skill) and never overwrite your changes without asking.

## Why no sync engine

Claude Code, OpenCode, Codex, Antigravity, and Grok have converged on the same Agent Skills standard: a `<name>/SKILL.md` folder with `name` + `description` frontmatter. A skill is written once and symlinked into each tool — there is no per-provider generation step. See [docs/adr/0001](docs/adr/0001-no-sync-engine-agent-skills-symlinks.md). How harnesses stay up to date without losing ownership: [docs/adr/0002](docs/adr/0002-harness-update-cli-and-manifest.md).

## Repo layout

```
.
├── bin/                 # CLI (create-cerberus / update / reinstall)
├── src/                 # scaffold, link, update, reinstall
├── build/               # refresh Matt skills inside template/skills/
├── template/            # what coachés get
│   └── skills/          # ALL skills (Matt + Cerberus), one flat folder
├── maintainer/          # THIS REPO ONLY — never shipped
│   └── skills/sync-mattpocock/
├── test/
└── CONTEXT.md
```

Edit Cerberus skills directly under `template/skills/` (e.g. `empty-trash`).  
`npm run build:template` refreshes Matt skills and **keeps** non-Matt dirs.

## Development

```bash
npm test                 # node:test suite
npm run build:template   # refresh Matt skills; preserve Cerberus skills in template/
node bin/create-cerberus.js test-harness
node bin/create-cerberus.js update test-harness
# Maintainer: skill maintainer/skills/sync-mattpocock
```

## License

MIT
