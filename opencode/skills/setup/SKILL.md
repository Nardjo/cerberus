---
name: setup
description: Project setup orchestrator. Two modes — "setup-project" configures issue tracker, triage labels, and domain docs for the current project; "setup-sandcastle" configures Sandcastle Docker isolation in the current project. Run setup-project before first use of tdd, triage, to-issues, or diagnose. Run setup-sandcastle when you want isolated agent sandboxes.
---

# Setup

Two adhocs available. Read the arguments to decide which one to run. If no argument, ask the user which setup they want.

## Adhoc: setup-project

Configure the per-repo settings that engineering skills need to function.

Sets up:
- Issue tracker (GitHub or local markdown)
- Triage label vocabulary
- Domain docs layout (CONTEXT.md, ADRs)

### Process

#### 1. Explore the repo

Read the current state without assumptions:
- `git remote -v` — is this a GitHub repo?
- `AGENTS.md` and `CLAUDE.md` at root — do they exist? Is there already a `## Agent skills` section?
- `CONTEXT.md`, `docs/adr/`, `.scratch/` — what already exists?
- `docs/agents/` — has this skill run before?

#### 2. Ask one question at a time

**Issue tracker** — where issues live. Skills like `to-issues`, `triage`, `to-prd` write here.
- GitHub (default if git remote points to GitHub)
- Local markdown under `.scratch/`
- Other (ask user to describe in one paragraph)

**Triage labels** — strings used by the `triage` skill state machine.
Default vocabulary (override if the repo uses different names):
- `needs-triage` — maintainer needs to evaluate
- `needs-info` — waiting on reporter
- `ready-for-agent` — fully specified, AFK-ready
- `ready-for-human` — needs human implementation
- `wontfix` — will not be actioned

**Domain docs** — where CONTEXT.md and ADRs live.
- Single-context: one `CONTEXT.md` + `docs/adr/` at root
- Multi-context: `CONTEXT-MAP.md` pointing to per-context files (monorepo)

#### 3. Write

Add `## Agent skills` block to `CLAUDE.md` (preferred) or `AGENTS.md`. Never create both.

Write three docs files:
- `docs/agents/issue-tracker.md`
- `docs/agents/triage-labels.md`
- `docs/agents/domain.md`

If `## Agent skills` block already exists, update it in-place.

#### 4. Confirm

Tell the user which engineering skills are now configured and that they can edit `docs/agents/*.md` directly later.

---

## Adhoc: setup-sandcastle

Configure Sandcastle agent isolation in the current project using Docker or Podman.

Sandcastle runs AI agents in isolated sandboxes with automatic branch management and commit tracking.

### Process

#### 1. Check prerequisites

- Is Docker or Podman installed? (`docker --version` / `podman --version`)
- Does `.sandcastle/` already exist?
- Does `package.json` exist? (needed for `sandcastle.config.ts`)

#### 2. Ask the user

- **Sandbox provider**: Docker (default) or Podman?
- **Branch strategy**: temporary branch (recommended) or direct write?
- **Which agent provider**: Claude Code, Codex, or OpenCode?

#### 3. Create `.sandcastle/`

Create `.sandcastle/Dockerfile`:
```dockerfile
FROM node:20-slim
RUN apt-get update && apt-get install -y git curl && rm -rf /var/lib/apt/lists/*
WORKDIR /workspace
```

Create `.sandcastle/.env.example`:
```
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
```

#### 4. Create `sandcastle.config.ts`

```typescript
import { run } from "@mattpocock/sandcastle";

await run({
  agent: {
    provider: "claude-code", // or "codex" / "opencode"
  },
  sandbox: {
    provider: "docker", // or "podman"
  },
  branch: {
    strategy: "temporary", // creates temp branch, merges on success
  },
  hooks: {
    onWorktreeReady: async ({ worktree }) => {
      // Setup commands run inside the sandbox
      // e.g. await worktree.exec("npm install")
    },
  },
  prompt: process.argv[2] ?? "Implement the next GitHub issue",
});
```

#### 5. Update CLAUDE.md / AGENTS.md

Add a `## Sandcastle` section explaining:
- How to run agents in isolation: `npx ts-node sandcastle.config.ts "your prompt"`
- Where to find sandbox logs
- Branch strategy in use

#### 6. Add to .gitignore

Append to `.gitignore`:
```
.sandcastle/.env
```

#### 7. Confirm

Tell the user Sandcastle is configured and show the command to run their first sandboxed agent.
