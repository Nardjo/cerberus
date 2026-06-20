# create-cerberus

Scaffold a multi-provider AI coding harness (Claude Code, OpenCode, Codex) based on Matt Pocock's engineering workflow.

## Usage

```bash
npx create-cerberus mon-harness
```

Creates a `mon-harness/` folder with a starter set of skills.

## Local development

```bash
cd cli
npm link
create-cerberus test-harness
```

Or run the entry point directly without linking:

```bash
node cli/bin/create-cerberus.js test-harness
```
