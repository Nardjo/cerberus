---
name: bear-cli
description: "Manage Bear notes via BearCLI - cat, show, list, search, search-in, edit, overwrite, create, append, tags, pin, trash, archive, restore, open, attachments, mcp-server. Use when user mentions Bear, bearcli, Bear notes, local notes, Markdown notes, Bear tags, Bear MCP, or wants to read/write/search Bear from terminal."
category: productivity
install_command: "mkdir -p ~/.local/bin && printf '%s\n' '#!/bin/sh' 'exec /Applications/Bear.app/Contents/MacOS/bearcli \"$@\"' > ~/.local/bin/bearcli && chmod 755 ~/.local/bin/bearcli"
---

# bear-cli

Use Bear's official `bearcli` for local Bear notes on macOS. BearCLI is bundled with Bear 2.8+ at `/Applications/Bear.app/Contents/MacOS/bearcli`.

References:
- https://blog.bear.app/2026/04/bear-2-8-bearcli-claude-connector-and-mcp-server/
- https://bear.app/faq/command-line-interface/

## When To Use This Skill

- Search, list, inspect, or count notes in the local Bear database.
- Read raw Markdown content or structured note metadata.
- Create notes, append content, edit exact text, or overwrite full notes.
- Manage tags, pins, archive/trash/restore state, and attachments.
- Configure a local MCP client to use Bear notes through `bearcli mcp-server`.

## Installed CLI

```bash
bearcli --version
bearcli --help
bearcli help all
```

If `bearcli` is missing but Bear is installed:

```bash
mkdir -p ~/.local/bin
printf '%s\n' '#!/bin/sh' 'exec /Applications/Bear.app/Contents/MacOS/bearcli "$@"' > ~/.local/bin/bearcli
chmod 755 ~/.local/bin/bearcli
```

This machine may also have an api2cli-compatible alias:

```bash
bear-cli --help
```

Prefer `bearcli` in examples because it matches Bear's docs.

## Working Rules

- Use `--format json` for read commands when parsing output.
- Read before writing: use `show --fields hash` before `overwrite` and pass `--base <hash>` for optimistic concurrency.
- Mutating commands are silent on success; check the exit code.
- Confirm before destructive or broad operations: `trash`, `overwrite`, `tags rename/delete`, `attachments delete`, `edit --all`, `pin remove`, and any command using `--force`.
- `edit` and `overwrite` protect attachments by default; only use `--force` after reading the rejection message.
- Encrypted note content cannot be read or modified through BearCLI.
- BearCLI reads and writes the local Bear database; no network is involved.

## Output Format

BearCLI uses native Bear JSON, not the api2cli envelope.

Read commands accept:

```bash
--format tsv
--format csv
--format json
--fields id,title,tags
```

JSON shapes:

| Command | Shape |
| --- | --- |
| `list`, `search`, `tags list`, `pin list`, `attachments list`, `search-in` | `[{...}]` |
| `show`, `create` | `{...}` |
| `cat` | `{"content":"..."}` |
| commands with `--count` | `{"count":N}` |
| errors with `--format json` | `{"error":{"code":"...","message":"..."}}` |

## Notes

| Command | Description |
| --- | --- |
| `bearcli list --format json --fields id,title,tags,modified` | List active notes |
| `bearcli list --tag work --format json` | List notes with tag and nested child tags |
| `bearcli list --location all --count --format json` | Count all notes, including archive and trash |
| `bearcli search "@today @todo" --format json` | Search with Bear query syntax |
| `bearcli search --query "- [ ]" --fields id,title,matches --format json` | Search queries that start with `-` |
| `bearcli search "@pinned #project" --sort modified:desc --limit 20 --format json` | Search and sort |
| `bearcli show <note-id> --format json --fields all` | Show note metadata |
| `bearcli show --title "Mars" --format json --fields id,title,hash,tags` | Show by case-insensitive title |
| `bearcli cat <note-id> --format json` | Read raw Markdown content |
| `bearcli cat --title "Mars" --offset 0 --limit 500 --format json` | Read a byte range |
| `bearcli search-in <note-id> --string "TODO" --format json` | Find exact text in one note |
| `bearcli search-in --title "Mars" --string "water" --context 160 --format json` | Search within a note by title |

Search syntax includes text terms, exact phrases, negation, `#tag`, `!#tag`, `#*/tag`, `@today`, `@yesterday`, `@last7days`, `@date(YYYY-MM-DD)`, `@todo`, `@done`, `@task`, `@tagged`, `@untagged`, `@title`, `@pinned`, `@images`, `@files`, `@attachments`, `@code`, `@locked`, `@readonly`, `@empty`, `@untitled`, `@wikilinks`, `@backlinks`, and `@ocr`.

## Writing Notes

| Command | Description |
| --- | --- |
| `bearcli create "My Note" --content "Body text" --format json` | Create a note and return metadata |
| `bearcli create --content "# Quick Capture\nSome thoughts" --format json` | Create with title derived from content |
| `bearcli create "My Note" --tags "work,draft" --format json` | Create with tags |
| `bearcli create "My Note" --if-not-exists --format json` | Return existing note with same title instead of duplicating |
| `bearcli append <note-id> --content "New paragraph"` | Append content at end |
| `bearcli append --title "Mars" --content "Update" --position beginning` | Insert near the beginning |
| `bearcli edit <note-id> --find "TODO" --replace "DONE"` | Replace first exact match |
| `bearcli edit <note-id> --find "cat" --replace "dog" --all --word` | Replace all whole-word matches |
| `bearcli edit <note-id> --find "## Notes" --insert-after "\nNew line"` | Insert after exact text |
| `bearcli overwrite <note-id> --base <hash> --content "# Title\nBody"` | Replace full content with hash guard |
| `printf "# Title\nBody" | bearcli overwrite <note-id> --base <hash>` | Replace full content from stdin |

`create` supports `--content`, `--tags`, `--if-not-exists`, `--format`, and `--fields`. `append` supports `--content`, `--position beginning|end`, and `--no-update-modified`. `edit` supports repeated `--find` plus `--replace`, `--insert-after`, or `--insert-before`, with `--all`, `--ignore-case`, `--word`, `--no-update-modified`, and `--force`. `overwrite` supports `--content`, `--base`, `--no-update-modified`, and `--force`.

## Tags

| Command | Description |
| --- | --- |
| `bearcli tags list --format json` | List all tags |
| `bearcli tags list <note-id> --format json` | List tags on a note |
| `bearcli tags list --title "Mars" --format json` | List tags by note title |
| `bearcli tags list --count --format json` | Count tags |
| `bearcli tags add <note-id> work "work/meetings"` | Add tags to a note |
| `bearcli tags add --title "Mars" favorite` | Add tag by note title |
| `bearcli tags remove <note-id> draft wip` | Remove tags from a note |
| `bearcli tags rename work job` | Rename a tag across notes |
| `bearcli tags rename old-tag existing-tag --force` | Merge into existing tag |
| `bearcli tags delete draft` | Delete tag from all notes |

Tags accept names with or without `#`. Nested tags use slashes.

## Pins And Locations

| Command | Description |
| --- | --- |
| `bearcli pin list --format json` | List every pin context in use |
| `bearcli pin list <note-id> --format json` | List pins on one note |
| `bearcli pin add <note-id> global` | Pin in All Notes |
| `bearcli pin add <note-id> work projects` | Pin inside tag contexts |
| `bearcli pin remove <note-id> global` | Remove global pin |
| `bearcli trash <note-id>` | Move note to trash |
| `bearcli archive <note-id>` | Move note to archive |
| `bearcli restore <note-id>` | Restore note from trash/archive |
| `bearcli open <note-id>` | Open note in Bear |
| `bearcli open --title "Mars" --header "Moons" --edit` | Open note at header for editing |

`trash` is a soft-delete; use `restore` to recover.

## Attachments

| Command | Description |
| --- | --- |
| `bearcli attachments list <note-id> --format json` | List attachments on a note |
| `cat photo.jpg | bearcli attachments add <note-id> --filename photo.jpg` | Add attachment from stdin |
| `bearcli attachments delete <note-id> --filename photo.jpg` | Delete attachment |
| `bearcli attachments save <note-id> --filename photo.jpg > photo.jpg` | Save raw attachment bytes |
| `bearcli attachments save <note-id> --filename photo.jpg --format json` | Save attachment as base64 JSON |

`attachments save` raw output requires redirection and is refused on a TTY.

## MCP Server

Configure MCP clients with:

```json
{
  "mcpServers": {
    "bear": {
      "command": "/Applications/Bear.app/Contents/MacOS/bearcli",
      "args": ["mcp-server"]
    }
  }
}
```

The MCP server exposes the same operation set as BearCLI over local stdio. It reads and writes the local Bear database only.

## Quick Reference

```bash
bearcli --help
bearcli help all
bearcli help list
bearcli help search
bearcli help create
bearcli help tags add
bearcli help attachments save
bearcli --version
```

## Verification

Minimum checks after install:

```bash
bearcli --version
bearcli --help
bearcli list --limit 1 --format json --fields id,title
```
