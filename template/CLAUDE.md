# Agent rules

Global rules for your AI coding agents. This file is symlinked into Claude Code (`~/.claude/CLAUDE.md`) and, as `AGENTS.md`, into OpenCode (`~/.config/opencode/AGENTS.md`) and Codex (`~/.codex/AGENTS.md`). Edit it to taste — it's yours.

## Language

- Respond in the user's language.
- Code comments in English.
- Commit messages in English, conventional format: `feat:`, `fix:`, `update:`, `refactor:`, `docs:`, `chore:`.
- Never use em dashes in written output; rephrase, or use a comma, colon, or parentheses.

## Workflow

- **Plan first.** For any non-trivial task (3+ steps or an architectural decision), plan before implementing. If something goes sideways, stop and re-plan rather than pushing on.
- **Use subagents** for research, exploration, and parallel analysis to keep the main context clean. One focused task per subagent.
- **Verify before done.** Never mark a task complete without proving it works: run the tests, check the logs, diff against the previous behavior.
- **Demand elegance.** For non-trivial changes, pause and ask "is there a simpler way?" before presenting. Skip this for obvious fixes; don't over-engineer.
- **Fix autonomously.** Given a bug report, reproduce and resolve it without hand-holding: point at the logs, the failing test, the error, then fix it.

## Self-improvement

- After any correction from the user, record the pattern in `tasks/lessons.md` and write a rule that prevents repeating it.
- Review `tasks/lessons.md` at the start of a session.

## Git

- Never add AI attribution to commits or PRs (`Co-Authored-By`, "Generated with", etc.).
- One-line commit messages, max 50 chars unless asked otherwise.
- Never use `--no-verify` or skip hooks.

## File deletion

- Prefer `trash` over `rm -rf` when available, so deletions stay recoverable.

## Task management

- Write the plan to `tasks/todo.md` as checkable items; confirm before implementing.
- Mark items complete as you go; add a short review section when done.

## Core principles

- **Simplicity first.** Make each change as small as possible; touch only what's necessary.
- **No temporary fixes.** Find the root cause, to senior-engineer standards.
- **Minimal impact.** Avoid incidental changes; don't introduce bugs.

## Skills

This harness ships a curated set of Agent Skills. See [SKILLS.md](SKILLS.md) for the catalog, and invoke a skill by name when a task matches its description.
