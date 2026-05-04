---
description: Full project setup — installs git hooks, configures issue tracker/triage/domain docs, and optionally sets up Sandcastle isolation. Run once when starting to use Cerberus skills in a new project.
---

# Setup Project

Run a complete project initialization for Cerberus workflow tooling.

## Steps

### 1. Locate the Cerberus installation

Find where Cerberus is installed on this machine:
```bash
# Check common locations
ls ~/Developer/cerberus/scripts/install-hooks.sh 2>/dev/null || \
ls ~/cerberus/scripts/install-hooks.sh 2>/dev/null || \
echo "NOT_FOUND"
```

If not found, tell the user to clone Cerberus first: `git clone https://github.com/Nardjo/cerberus`

### 2. Install git hooks

Run the hook installer pointing to the current project directory:
```bash
CERBERUS_DIR=<path-to-cerberus> PROJECT_DIR=$(pwd) bash <path-to-cerberus>/scripts/install-hooks.sh
```

This installs the `pre-commit` hook that syncs skills across providers automatically on every commit.

Confirm the hook is installed:
```bash
ls -la .git/hooks/pre-commit
```

### 3. Run setup-project adhoc

Invoke the `setup` skill in `setup-project` mode. This configures:
- Issue tracker (GitHub / local markdown / other)
- Triage label vocabulary
- Domain docs (CONTEXT.md, ADRs)
- `## Agent skills` block in CLAUDE.md or AGENTS.md

### 4. Ask about Sandcastle

> Do you want to configure Sandcastle for running agents in isolated Docker sandboxes? (y/n)

If yes: invoke the `setup` skill in `setup-sandcastle` mode.

### 5. Summary

Report what was configured:
- Git hook status
- Issue tracker location
- Triage labels (default or custom)
- Domain docs layout
- Sandcastle status
- Which skills are now ready to use
