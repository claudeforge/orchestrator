---
name: resume
description: Resume a paused orchestrator session
allowed-tools: Read, Write, Bash
model: claude-opus-4-5-20251101
---

# Orchestrator: Resume

Resume a paused orchestrator session.

## Instructions

1. Check if pause flag exists at `.claude/orchestrator/.pause`
2. If exists, remove it and update state
3. Then trigger `/orch:continue` to resume

## Actions

1. **Check pause flag:**
   - If `.claude/orchestrator/.pause` exists, read and delete it
   - If doesn't exist, inform user orchestrator wasn't paused

2. **Update state:**
   Add history entry:
   ```json
   {
     "timestamp": "[ISO timestamp]",
     "action": "resumed",
     "details": { "pausedAt": "[from pause flag]" }
   }
   ```

3. **Display status and continue:**
   ```markdown
   ## Orchestrator Resumed

   **Paused at:** [timestamp]
   **Duration:** [time since pause]

   **Current Status:**
   - Phase: implementation
   - Progress: 24/40 tasks (60%)

   **Resuming autonomous development...**

   [Continue with /orch:continue logic]
   ```

## If Not Paused

```markdown
## Orchestrator Not Paused

The orchestrator is not currently paused.

**Current Status:**
- Phase: [phase]
- Progress: [X/Y] tasks

Run `/orch:continue` to start/continue development.
Run `/orch:status` for detailed status.
```
