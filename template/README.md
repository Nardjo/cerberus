# Mon harness

Un harness multi-provider (Claude Code, OpenCode, Codex, Antigravity, Grok), basé sur le workflow engineering de Matt Pocock.

## Structure

```
.
├── skills/           # skills partagés (format Agent Skills)
├── commands/         # commandes partagées (symlinkées dans chaque outil)
├── tools/
│   ├── claude/       # settings.json, hooks/, agents/
│   ├── opencode/     # opencode.json, plugins/
│   ├── codex/        # hooks.json
│   ├── gemini/       # settings.json, agents/ (Antigravity)
│   └── grok/         # config.toml, hooks/
├── CLAUDE.md         # règles Claude Code
├── AGENTS.md         # règles OpenCode / Codex / Gemini / Grok
├── RTK.md            # Rust Token Killer (préfixe `rtk` sur les commandes bruyantes)
├── SKILLS.md         # catalogue
└── setup.sh          # adopt + link (+ install RTK si absent)
```

`setup.sh` **adopte** tes configs / hooks / plugins déjà présents sous `~/.claude`, etc., puis les **symlink** depuis ce dossier. Les secrets (`settings.local.json`, auth, config.toml Codex) restent hors harness.

**RTK** : si le binaire n'est pas installé, `setup.sh` tente `brew install rtk` (ou le script curl). Puis il branche les hooks Claude/OpenCode et symlink `RTK.md`.

**trash** : si absent, `setup.sh` tente `brew install trash` (CLI hasseg, corbeille macOS). Les règles du harness interdisent `rm` : les agents passent par `trash` pour tout pouvoir récupérer.

## Brancher le harness à tes outils

```bash
bash setup.sh
```

Relance après avoir installé un nouvel outil.

## C'est à toi

Ce dossier t'appartient. Versionne-le dans git si tu veux et fais-le évoluer librement.
