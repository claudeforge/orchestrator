---
name: status
description: Show current orchestrator progress and project status
allowed-tools: Read, Glob
model: claude-opus-4-5-20251101
---

# Orchestrator: Status

Display the current project status from the orchestrator state.

## Instructions

1. Read the state file at `.claude/orchestrator/state/project.json`
2. If it doesn't exist, inform the user to run `/orch:start` first
3. Display a comprehensive status dashboard

## Status Dashboard Format

```markdown
╔═══════════════════════════════════════════════════════════════╗
║                    ORCHESTRATOR STATUS                        ║
╠═══════════════════════════════════════════════════════════════╣
║  Project: [name]                                              ║
║  Phase:   [phase]                                             ║
╚═══════════════════════════════════════════════════════════════╝

## Progress

[████████████░░░░░░░░] 60% (24/40 tasks)

| Status      | Count |
|-------------|-------|
| ✓ Completed | 24    |
| → In Progress | 2   |
| ⚠ Blocked   | 1     |
| ○ Pending   | 13    |

## Current Phase: [implementation]

Phases:
  ✓ Ideation       [complete]
  ✓ Specification  [complete]
  ✓ Architecture   [complete]
  ✓ Planning       [complete]
  → Implementation [in_progress]
  ○ Testing        [pending]
  ○ Deployment     [pending]

## Currently Running

| Task | Agent | Started | Attempt |
|------|-------|---------|---------|
| TASK-025 | frontend-dev | 5m ago | 1 |
| TASK-026 | backend-dev | 3m ago | 1 |

## Blockers

⚠ TASK-019: External API not responding (3 attempts)
   Since: 2h ago
   Reason: Network timeout

## Recent Activity

- 10:45 ✓ TASK-024 completed (frontend-dev)
- 10:42 ✓ TASK-023 completed (backend-dev)
- 10:38 ✓ TASK-022 completed (test-engineer)
- 10:35 ✓ TASK-021 completed (frontend-dev)
- 10:30 🔖 Checkpoint CP-004 created

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | React 19, TypeScript    |
| Backend  | Node.js, Hono           |
| Database | PostgreSQL, Drizzle     |
| Testing  | Vitest, Playwright      |

## Checkpoints

| ID     | Time    | Tasks | Commit  |
|--------|---------|-------|---------|
| CP-004 | 10:30   | 20    | abc123  |
| CP-003 | 09:45   | 15    | def456  |
| CP-002 | 09:00   | 10    | ghi789  |

## Commands

- `/orch:continue` - Resume autonomous development
- `/orch:tasks` - View all tasks
- `/orch:pause` - Pause after current task
- `/orch:rollback CP-003` - Rollback to checkpoint
```

## State File Schema

The state file contains:

```json
{
  "project": { "name": "...", "description": "..." },
  "phase": "implementation",
  "phases": { ... },
  "techStack": { ... },
  "tasks": [ ... ],
  "currentTasks": [ ... ],
  "progress": {
    "total": 40,
    "completed": 24,
    "inProgress": 2,
    "blocked": 1,
    "percentage": 60
  },
  "blockers": [ ... ],
  "checkpoints": [ ... ],
  "history": [ ... ]
}
```

## Error Handling

- If state file doesn't exist: Show message to run `/orch:start`
- If state file is corrupted: Suggest rollback to last checkpoint
- If no tasks: Show planning phase status
