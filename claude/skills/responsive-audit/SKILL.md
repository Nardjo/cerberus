---
name: responsive-audit
description: "Parallel responsive design audit and fix for Nuxt/Vue apps. Spawns agents per component group to fix mobile/tablet/desktop breakpoints."
allowed-tools: "Task, Read, Bash, Glob, Grep, AskUserQuestion, TaskCreate, TaskUpdate, TaskList, TaskGet, TeamCreate, TeamDelete, SendMessage"
argument-hint: "[path-to-app] [--audit-only] [--fix]"
---

# Responsive Audit — Parallel Design Fixer

## Overview

Orchestrates parallel agents to audit and fix responsive design issues across a Nuxt/Vue app. Each agent handles a group of components, validates with `nuxt build`, and reports back.

```
SCAN → GROUP → [APPROVE] → PARALLEL FIX → BUILD → REPORT
                  ⚠️
               MANDATORY
```

## Usage

| Command | Behavior |
|---------|----------|
| `/responsive-audit` | Full audit + fix in current directory |
| `/responsive-audit ./apps/aura` | Target a specific app |
| `/responsive-audit --audit-only` | Report issues without fixing |
| `/responsive-audit --fix` | Skip audit, fix known issues directly |

## Breakpoints

Standard breakpoints used for analysis:

| Name | Width | Tailwind |
|------|-------|----------|
| Mobile | 375px | default (mobile-first) |
| Tablet | 768px | `md:` |
| Desktop | 1440px | `lg:` / `xl:` |

## Workflow

### Step 1 — Scan

Detect the project structure and package manager:

```
1. Find all .vue files (exclude node_modules, .nuxt, .output)
2. Detect package manager (bun.lockb → bun, pnpm-lock.yaml → pnpm, else npm)
3. Identify CSS framework (Tailwind, UnoCSS, vanilla)
4. Count total components
```

### Step 2 — Group Components

Group files into logical batches (max 4 files per group):

```
- layouts/      → 1 group
- pages/        → 1-2 groups
- components/ui → 1 group
- components/*  → 1 group per subdirectory
```

Present the grouping to the user for review.

### Step 3 — User Approval (MANDATORY)

Show the user:
- Number of groups and files per group
- Detected framework and breakpoints
- Estimated agents to spawn
- Ask: "On lance l'audit/fix ?" — **WAIT for approval**

### Step 4 — Parallel Fix (Team Mode)

Create a team and spawn one agent per group:

```
TeamCreate({ team_name: "responsive-<timestamp>" })
```

For each component group, spawn an agent:

```
Task({
  subagent_type: "general-purpose",
  team_name: "responsive-<timestamp>",
  name: "responsive-<group-name>",
  prompt: <see Agent Prompt below>
})
```

#### Agent Prompt Template

```
You are a responsive design specialist for a Nuxt/Vue app.

## Your assigned files
{list of 1-4 .vue files}

## Instructions

1. **Read** each file completely
2. **Audit** for responsive issues at 375px, 768px, and 1440px:
   - Fixed widths that break on mobile (px instead of %, vw, or responsive classes)
   - Missing responsive classes (no sm:/md:/lg: variants)
   - Text overflow or truncation issues
   - Flex/grid layouts that don't adapt
   - Images without responsive sizing
   - Touch targets too small on mobile (< 44px)
   - Horizontal scroll caused by overflow
3. **Fix** using mobile-first approach:
   - Base styles = mobile (375px)
   - `md:` variants = tablet (768px)
   - `lg:` / `xl:` variants = desktop (1440px)
   - Use Tailwind/UnoCSS responsive prefixes
   - Prefer `w-full`, `max-w-*`, `flex`, `grid` over fixed sizes
4. **Validate**: Run `{pm} run build` after your changes
5. **Report**: Mark your task as completed with a summary of changes

## Rules
- Mobile-first ALWAYS: base = mobile, add complexity for larger screens
- Do NOT change colors, fonts, or content — only layout/spacing/sizing
- Do NOT add new dependencies
- If build fails after your changes, fix the error before reporting
```

### Step 5 — Integration Build

After all agents complete:

```bash
{pm} run build 2>&1
```

If build fails, identify which agent's changes broke it and ask them to fix.

### Step 6 — Report

Present a summary to the user:

```
## Responsive Audit Report

### Files modified: X / Y total
### Issues found: N
### Issues fixed: N

| Group | Files | Changes | Status |
|-------|-------|---------|--------|
| layouts | 2 | 5 fixes | ✓ |
| pages | 4 | 12 fixes | ✓ |
| components/ui | 3 | 8 fixes | ✓ |

### Common patterns fixed:
- Fixed widths → responsive (N occurrences)
- Missing md: breakpoints (N occurrences)
- ...
```

Ask user: "Tu veux que je commit ces changements ?"

## Audit-Only Mode (`--audit-only`)

Same scan and grouping, but agents only **report** issues without fixing. Output a markdown report with:
- File path and line number
- Issue description
- Suggested fix
- Severity (critical / warning / info)

## Rules

1. **ALWAYS get user approval** before spawning agents
2. **Mobile-first** — never desktop-down
3. **Don't touch non-layout CSS** — no colors, fonts, animations
4. **Build must pass** — every agent validates independently
5. **Max 5 parallel agents** — avoid overwhelming the system
6. **Use the project's package manager** — detect from lockfile

## Start

When user invokes `/responsive-audit`:

1. Detect project path (argument or cwd)
2. Run Step 1 (Scan)
3. Run Step 2 (Group)
4. Run Step 3 (Approve) — **BLOCKING**
5. Run Step 4 (Parallel Fix or Audit)
6. Run Step 5 (Build)
7. Run Step 6 (Report)

**BEGIN**
