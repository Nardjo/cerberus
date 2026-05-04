---
name: half-clone
description: Clone the later half of the current conversation, discarding earlier context to reduce token usage while preserving recent work.
---

Clone the later half of the current conversation, discarding earlier context to reduce token usage while preserving recent work.

Steps:
1. Get the current session ID and project path: `tail -1 ~/.claude/history.jsonl | jq -r '[.sessionId, .project] | @tsv'`
2. Script path: `~/.claude/scripts/half-clone-conversation.sh` (symlinked from ~/Developer/cerberus/scripts/). Verify it exists with `test -x ~/.claude/scripts/half-clone-conversation.sh`.
3. Preview the conversation to verify the session ID: `~/.claude/scripts/half-clone-conversation.sh --preview <session-id> <project-path>`
   - Check that the first and last messages match the current conversation
4. Run the clone: `~/.claude/scripts/half-clone-conversation.sh <session-id> <project-path>`
   - Always pass the project path from the history entry, not the current working directory
5. Tell the user they can access the half-cloned conversation with `claude -r` and look for the one marked `[HALF-CLONE <timestamp>]`.
