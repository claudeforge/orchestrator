---
name: rollback
description: Rollback to a previous checkpoint
allowed-tools: Read, Write, Bash
argument-hint: <checkpoint-id>
model: claude-opus-4-5-20251101
---

# Orchestrator: Rollback

Rollback project state to a previous checkpoint.

## Arguments

- `$ARGUMENTS` - Checkpoint ID (e.g., CP-003)

## Instructions

1. Parse checkpoint ID from arguments
2. Verify checkpoint exists
3. Restore state from checkpoint
4. Optionally restore git state

## Process

1. **List available checkpoints** (if no argument):
   ```markdown
   ## Available Checkpoints

   | ID | Time | Phase | Tasks | Commit |
   |----|------|-------|-------|--------|
   | CP-004 | 10:30 | implementation | 20 | abc123 |
   | CP-003 | 09:45 | implementation | 15 | def456 |
   | CP-002 | 09:00 | planning | 10 | ghi789 |

   Run `/orch:rollback CP-003` to rollback to a specific checkpoint.
   ```

2. **Verify checkpoint exists:**
   - Check `.claude/orchestrator/checkpoints/[CP-XXX].json`
   - If not found, show error and list available

3. **Confirm rollback:**
   ```markdown
   ## Rollback Confirmation

   Rolling back to: **CP-003**
   - Created: 09:45
   - Tasks completed: 15 (current: 24)
   - Git commit: def456

   ⚠ This will:
   - Reset task status to checkpoint state
   - Mark 9 tasks as pending again
   - Optionally reset git to commit def456

   Proceed with rollback?
   ```

4. **Execute rollback:**
   - Copy checkpoint state to project.json
   - Update history with rollback entry
   - Optionally: `git reset --hard [commit]`

5. **Display result:**
   ```markdown
   ## Rollback Complete

   Restored to checkpoint **CP-003**

   **Current Status:**
   - Phase: implementation
   - Progress: 15/40 tasks (37.5%)

   **Git Status:**
   - Reset to commit: def456
   - Working directory clean

   Run `/orch:continue` to resume from this point.
   ```

## Git Rollback (Optional)

Ask user if they want to rollback git as well:

```markdown
**Git Rollback Options:**

1. **Full rollback** - Reset git to checkpoint commit
   ```bash
   git reset --hard def456
   ```

2. **Keep files** - Only reset orchestrator state
   - Files remain as-is
   - Only task status changes

3. **Soft reset** - Reset git but keep changes staged
   ```bash
   git reset --soft def456
   ```

Which option? (1/2/3)
```

## Error Handling

- **Checkpoint not found:** List available checkpoints
- **Git reset fails:** Warn but continue with state rollback
- **State corrupted:** Restore from backup or reinitialize
