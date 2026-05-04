#!/usr/bin/env python3
"""Syncs skills from claude/skills/ to opencode.json and codex/skills/."""

import json
import os
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

    # Parse line by line, handling block scalars (| and >)
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
            # Block scalar — collect indented lines
            i += 1
            block_lines = []
            while i < len(lines) and (not lines[i] or lines[i][0] in (" ", "\t")):
                block_lines.append(lines[i].strip())
                i += 1
            if val.startswith(">"):
                # Folded: join with space, collapse blank lines to newline
                result[key] = " ".join(l for l in block_lines if l)
            else:
                # Literal: preserve newlines
                result[key] = "\n".join(block_lines)
        else:
            result[key] = val.strip('"').strip("'")
            i += 1

    return result


def sync_to_codex(skills_dir: Path, codex_dir: Path) -> int:
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


def sync_to_opencode(skills_dir: Path, opencode_json: Path) -> int:
    if not opencode_json.exists():
        print("sync: opencode.json not found, skipping")
        return 0

    data = json.loads(opencode_json.read_text(encoding="utf-8"))
    data.setdefault("command", {})
    synced = 0

    for skill_dir in sorted(skills_dir.iterdir()):
        if not skill_dir.is_dir():
            continue
        src = skill_dir / "skill.md"
        if not src.exists():
            continue

        fm = extract_frontmatter(src)
        description = fm.get("description", "").strip()
        if not description:
            continue

        skill_name = skill_dir.name
        if skill_name not in data["command"]:
            data["command"][skill_name] = {
                "description": description,
                "template": "$ARGUMENTS",
            }
            synced += 1

    if synced > 0:
        opencode_json.write_text(
            json.dumps(data, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )

    return synced


def main():
    repo_root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.cwd()
    skills_dir = repo_root / "claude" / "skills"
    codex_dir = repo_root / "codex" / "skills"
    opencode_json = repo_root / "opencode" / "opencode.json"

    if not skills_dir.exists():
        print(f"sync: {skills_dir} not found, nothing to sync")
        sys.exit(0)

    codex_count = sync_to_codex(skills_dir, codex_dir)
    opencode_count = sync_to_opencode(skills_dir, opencode_json)

    if codex_count:
        print(f"sync: {codex_count} skill(s) → codex/skills/")
    if opencode_count:
        print(f"sync: {opencode_count} skill(s) → opencode.json")

    print("sync: done")


if __name__ == "__main__":
    main()
