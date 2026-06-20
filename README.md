# create-cerberus

> Scaffold a multi-provider AI coding harness — one `npx` command.

`create-cerberus` hands anyone a clean, multi-provider harness of skills (Matt Pocock's engineering + productivity workflow) that works in Claude Code, OpenCode, and Codex.

## Usage

```bash
npx create-cerberus mon-harness
```

Creates `mon-harness/`, then detects your installed tools and symlinks the skills into each one (nothing for tools you don't have). No questions, no `git init` — the folder is yours.

## What you get

- The 19 skills of Matt Pocock's `engineering/` + `productivity/` workflow, in the Agent Skills format
- A `setup.sh` that links them into Claude Code, OpenCode, and Codex (re-run it after installing a new tool)
- Yours to own and evolve — no updates are pushed back

## Why no sync engine

Claude Code, OpenCode, and Codex have converged on the same Agent Skills standard: a `<name>/SKILL.md` folder with `name` + `description` frontmatter. A skill is written once and symlinked into each tool — there is no per-provider generation step. See [docs/adr/0001](docs/adr/0001-no-sync-engine-agent-skills-symlinks.md).

## Repo layout

```
.
├── cli/              # the create-cerberus npm package
│   ├── bin/ src/ build/ template/ test/
│   └── package.json
├── docs/adr/         # architecture decisions
├── CONTEXT.md        # domain glossary
└── README.md
```

## Development

```bash
cd cli
npm test                 # node:test suite
npm run build:template   # refresh template/skills from mattpocock/skills
node bin/create-cerberus.js test-harness
```

## License

MIT
