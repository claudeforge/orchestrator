---
description: List all tasks with their status, agents, and dependencies
allowed-tools: Read, Glob
---
# Orchestrator: Tasks
Display all tasks from the orchestrator task list.
## Instructions
1. Read state from `.claude/orchestrator/state/project.json`
2. Display tasks grouped by status and epic
3. Show dependencies and assigned agents
## Task List Format
```markdown
# Task List
**Total:** 40 tasks | **Completed:** 24 | **Remaining:** 16
## By Status
### ✓ Completed (24)
| ID | Title | Agent | Time |
|----|-------|-------|------|
| TASK-001 | Setup project structure | orchestrator | 5m |
| TASK-002 | Initialize React app | frontend-dev | 8m |
| ... | ... | ... | ... |
### → In Progress (2)
| ID | Title | Agent | Started | Attempt |
|----|-------|-------|---------|---------|
| TASK-025 | Create user dashboard | frontend-dev | 5m ago | 1 |
| TASK-026 | Implement auth API | backend-dev | 3m ago | 1 |
### ⚠ Blocked (1)
| ID | Title | Agent | Reason | Attempts |
|----|-------|-------|--------|----------|
| TASK-019 | Integrate external API | backend-dev | Network timeout | 3 |
### ○ Pending (13)
| ID | Title | Agent | Priority | Dependencies |
|----|-------|-------|----------|--------------|
| TASK-027 | User settings page | frontend-dev | high | TASK-025 |
| TASK-028 | Settings API | backend-dev | high | TASK-026 |
| ... | ... | ... | ... | ... |
---
## By Epic
### Epic: User Authentication
- ✓ TASK-010: Login form component
- ✓ TASK-011: Auth API endpoints
- ✓ TASK-012: JWT token handling
- → TASK-026: Session management
- ○ TASK-033: Password reset flow
### Epic: Dashboard
- ✓ TASK-020: Dashboard layout
- ✓ TASK-021: Stats widgets
- → TASK-025: User dashboard
- ○ TASK-027: Settings page
---
## Dependency Graph
```
TASK-001 (setup)
    ├── TASK-002 (frontend init)
    │   ├── TASK-010 (login form)
    │   │   └── TASK-025 (dashboard) [IN PROGRESS]
    │   └── TASK-020 (dashboard layout)
    └── TASK-003 (backend init)
        ├── TASK-011 (auth API)
        │   └── TASK-026 (session) [IN PROGRESS]
        └── TASK-004 (database setup)
```
## Filter Options
You can ask for filtered views:
- "Show only blocked tasks"
- "Show frontend tasks"
- "Show tasks for TASK-025 dependencies"
- "Show critical priority tasks"
```
## Task Schema
Each task contains:
```json
{
  "id": "TASK-025",
  "title": "Create user dashboard",
  "description": "Build the main dashboard view with user stats",
  "status": "in_progress",
  "priority": "high",
  "agent": "frontend-dev",
  "epic": "dashboard",
  "story": "user-dashboard",
  "dependencies": ["TASK-020", "TASK-021"],
  "outputs": ["src/pages/Dashboard.tsx"],
  "acceptanceCriteria": [
    "Dashboard displays user stats",
    "Responsive layout",
    "Loading states"
  ],
  "estimatedMinutes": 15,
  "actualMinutes": null,
  "attempts": 1,
  "startedAt": "2025-01-12T10:40:00Z",
  "completedAt": null
}
```
