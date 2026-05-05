#!/usr/bin/env python3
"""Syncs claude/ skills/commands/agents to opencode/ and codex/ provider formats."""

import json
import re
import shutil
import sys
from pathlib import Path


def extract_frontmatter(path: Path) -> dict:
    """Extract YAML frontmatter fields without requiring PyYAML."""
    content = path.read_text(encoding="utf-8")
    m = re.match(r"^---\s*\n(.*?)\n---", content, re.DOTALL)
    if not m:
        return {}

    fm_text = m.group(1)
    result = {}

    lines = fm_text.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        kv = re.match(r"^(\w[\w-]*):\s*(.*)", line)
        if not kv:
            i += 1
            continue

        key = kv.group(1)
        val = kv.group(2).strip()

        if val in ("|", ">", "|+", "|-", ">+", ">-"):
            i += 1
            block_lines = []
            while i < len(lines) and (not lines[i] or lines[i][0] in (" ", "\t")):
                block_lines.append(lines[i].strip())
                i += 1
            if val.startswith(">"):
                result[key] = " ".join(l for l in block_lines if l)
            else:
                result[key] = "\n".join(block_lines)
        else:
            result[key] = val.strip('"').strip("'")
            i += 1

    return result


def sync_files(src_dir: Path, dest_dir: Path, pattern: str = "*.md") -> int:
    """Copy files from src_dir to dest_dir if newer."""
    dest_dir.mkdir(parents=True, exist_ok=True)
    synced = 0

    for src in sorted(src_dir.glob(pattern)):
        dest = dest_dir / src.name
        if not dest.exists() or src.stat().st_mtime > dest.stat().st_mtime:
            shutil.copy2(src, dest)
            synced += 1

    return synced


def sync_skills_to_codex(skills_dir: Path, codex_dir: Path) -> int:
    """Copy claude/skills/*/skill.md → codex/skills/<name>.md (flat files)"""
    codex_dir.mkdir(parents=True, exist_ok=True)
    synced = 0

    for skill_dir in sorted(skills_dir.iterdir()):
        if not skill_dir.is_dir():
            continue
        src = skill_dir / "skill.md"
        if not src.exists():
            continue

        dest = codex_dir / f"{skill_dir.name}.md"
        if not dest.exists() or src.stat().st_mtime > dest.stat().st_mtime:
            shutil.copy2(src, dest)
            synced += 1

    return synced


def sync_skills_to_opencode(skills_dir: Path, opencode_skills_dir: Path) -> int:
    """Copy claude/skills/*/skill.md → opencode/skills/<name>/SKILL.md (subdirs)"""
    synced = 0

    for skill_dir in sorted(skills_dir.iterdir()):
        if not skill_dir.is_dir():
            continue
        src = skill_dir / "skill.md"
        if not src.exists():
            continue

        dest_dir = opencode_skills_dir / skill_dir.name
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest = dest_dir / "SKILL.md"
        if not dest.exists() or src.stat().st_mtime > dest.stat().st_mtime:
            shutil.copy2(src, dest)
            synced += 1

    return synced


def main():
    repo_root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.cwd()

    claude_skills = repo_root / "claude" / "skills"
    claude_commands = repo_root / "claude" / "commands"
    claude_agents = repo_root / "claude" / "agents"

    codex_skills = repo_root / "codex" / "skills"

    opencode_skills = repo_root / "opencode" / "skills"
    opencode_commands = repo_root / "opencode" / "commands"
    opencode_agents = repo_root / "opencode" / "agents"

    if not claude_skills.exists():
        print(f"sync: {claude_skills} not found, nothing to sync")
        sys.exit(0)

    codex_count = sync_skills_to_codex(claude_skills, codex_skills)
    opencode_skills_count = sync_skills_to_opencode(claude_skills, opencode_skills)

    # Commands: sync .md files to opencode/commands/
    cmd_count = sync_files(claude_commands, opencode_commands) if claude_commands.exists() else 0

    # Agents: sync .md files to opencode/agents/
    agent_count = sync_files(claude_agents, opencode_agents) if claude_agents.exists() else 0

    if codex_count:
        print(f"sync: {codex_count} skill(s) → codex/skills/")
    if opencode_skills_count:
        print(f"sync: {opencode_skills_count} skill(s) → opencode/skills/")
    if cmd_count:
        print(f"sync: {cmd_count} command(s) → opencode/commands/")
    if agent_count:
        print(f"sync: {agent_count} agent(s) → opencode/agents/")

    print("sync: done")


if __name__ == "__main__":
    main()
