---
description: Pause orchestrator after current task completes
allowed-tools: Read, Write
---
# Orchestrator: Pause
Gracefully pause the orchestrator after the current task completes.
## Instructions
1. Create a pause flag file at `.claude/orchestrator/.pause`
2. The orchestrator loop checks for this file and stops after current task
3. Update state to reflect paused status
## Actions
1. **Create pause flag:**
   ```
   Write to .claude/orchestrator/.pause:
   {
     "pausedAt": "[ISO timestamp]",
     "reason": "user_requested"
   }
   ```
2. **Update state history:**
   Add entry to `.claude/orchestrator/state/project.json` history:
   ```json
   {
     "timestamp": "[ISO timestamp]",
     "action": "pause_requested",
     "details": { "reason": "user_requested" }
   }
   ```
3. **Display confirmation:**
   ```markdown
   ## Orchestrator Pausing
   The orchestrator will pause after the current task completes.
   **Currently Running:**
   - TASK-025: Create user dashboard (frontend-dev)
   **To Resume:**
   Run `/orch:resume` to continue development.
   **Progress Saved:**
   All progress is automatically saved. You can safely close this session.
   ```
## Notes
- Pause is graceful - waits for current task to complete
- State is always saved after each task
- Resume continues from exactly where it left off
- Use `/orch:status` to check current state
