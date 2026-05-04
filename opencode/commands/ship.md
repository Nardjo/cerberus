---
description: Commit + push + PR + CI check in one command. Ship your changes fast.
allowed-tools: Bash(git :*), Bash(gh :*), Bash(sleep :*)
argument-hint: [commit message]
---

You are a shipping automation tool. Commit, push, create PR, and verify CI in one swift action.

## Workflow

```
git add → git commit → git push → gh pr create → watch CI
```

### 1. Stage All

```bash
git add -A
```

### 2. Check Changes

```bash
git diff --cached --stat
```

If no changes, exit with "Nothing to ship".

### 3. Commit

- If message provided: use it directly
- If no message: generate from diff (one line, max 50 chars)

Format: `type: description`

- `feat:` new feature
- `fix:` bug fix
- `update:` modification
- `refactor:` restructure

```bash
git commit -m "type: message"
```

### 4. Push

```bash
git push -u origin HEAD
```

### 5. Create PR

Build a standardized body from the diff against the base branch (main/master) — never let GitHub create an empty PR.

**Title**: the commit subject (or, if multiple commits, the most recent `feat:`/`fix:`/`update:`/`refactor:` subject).

**Body template** (always all three sections, in this exact order):

```markdown
## Summary

<one-line synthesis of what this PR does — derived from commit subjects + diff scope, NOT a copy of the commit message>

## Changes

<bulleted list of the top 10 modified paths from `git diff --stat <base>...HEAD`, grouped by area when obvious (api/, web/, infra/, etc.). Format: `- \`path/to/file\` — short note`. If >10 files, end with `- …and N more`>

## Test plan

- [ ] CI passes
- [ ] <one context-specific check inferred from the diff: e.g. "Manual smoke test on /endpoint", "Verify migration runs cleanly", "Visual check on mobile breakpoint". Pick ONE, keep it actionable>
```

Create the PR:

```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
<rendered body>
EOF
)"
```

- If PR already exists, get URL: `gh pr view --json url -q .url` (do not try to update the body — leave existing PRs alone)
- Detect base branch via `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`

### 6. Watch CI

Wait for GitHub Actions to pick up the push, then monitor:

```bash
sleep 30
gh run list --branch $(git branch --show-current) --limit 1
```

Monitor the run:

```bash
gh run watch <run-id>
```

**On success**: Report green status.

**On failure**:

- Analyze: `gh run view <run-id> --log-failed`
- Identify root cause from error logs
- Fix code with targeted changes
- Commit and push the fix
- Re-monitor (max 3 attempts)
- After 3 failures: stop and report to user

### 7. Output

```
Shipped ✓
commit: feat: add user auth
branch: feature/auth
pr: https://github.com/user/repo/pull/123
ci: ✓ passed (or ✗ failed after 3 attempts)
```

## Rules

- **NO interactive prompts**
- **NO verbose output**
- **NO confirmations** - just ship it
- If push fails → show error, stop
- If PR exists → return existing URL
- Auto-detect base branch (main/master)
- CI fixes: only fix CI-related errors, stay in scope

## Priority

Speed > Everything. Ship fast, iterate faster.
