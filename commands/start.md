---
description: Start a new project with the Orchestrator - transforms your idea into a complete development plan
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Task, WebSearch, AskUserQuestion
---
# Orchestrator: Start New Project
You are the Orchestrator initialization system. Your job is to transform a user's idea into a complete, actionable development plan.
## Process Overview
```
IDEA → SPECIFICATION → ARCHITECTURE → TASKS → READY
```
## Step 1: Understand the Idea
First, gather information about the project. Ask the user:
1. **What do you want to build?** (brief description)
2. **Who will use it?** (target users)
3. **What are the 3 most important features?** (core functionality)
Use AskUserQuestion to gather this information if not already provided.
## Step 2: Create Specification
Delegate to the `spec-writer` agent to create a detailed specification:
```
Task(
  agent: "spec-writer",
  prompt: "Create a comprehensive specification for: [project description]
  Target users: [users]
  Core features: [features]
  Generate a complete specification including:
  - Executive summary
  - Problem statement
  - User stories with acceptance criteria
  - Functional requirements (P0/P1/P2)
  - Non-functional requirements
  - Success metrics
  Save to: .claude/orchestrator/spec/specification.md"
)
```
## Step 3: Design Architecture
Delegate to the `architect` agent to design the system:
```
Task(
  agent: "architect",
  prompt: "Based on the specification at .claude/orchestrator/spec/specification.md,
  design the system architecture.
  Include:
  - Tech stack selection with rationale (ADR format)
  - System design diagram (ASCII)
  - Data model
  - API design overview
  - Security considerations
  Save to: .claude/orchestrator/plan/architecture.md"
)
```
## Step 4: Break Down Tasks
Delegate to the `task-planner` agent to create atomic tasks:
```
Task(
  agent: "task-planner",
  prompt: "Based on:
  - Specification: .claude/orchestrator/spec/specification.md
  - Architecture: .claude/orchestrator/plan/architecture.md
  Create a complete task breakdown:
  - Break into Epics → Stories → Tasks
  - Each task max 15-20 minutes
  - Assign appropriate agent to each task
  - Map dependencies
  - Prioritize (P0 critical path first)
  Save to: .claude/orchestrator/state/tasks.json"
)
```
## Step 5: Initialize State
Create the project state file at `.claude/orchestrator/state/project.json`:
```json
{
  "$schema": "orchestrator-state-v1",
  "project": {
    "id": "[generate uuid]",
    "name": "[project name]",
    "slug": "[project-slug]",
    "description": "[description]",
    "created": "[ISO timestamp]",
    "updated": "[ISO timestamp]",
    "version": "0.1.0"
  },
  "phase": "planning",
  "phases": {
    "ideation": { "status": "complete", "startedAt": "...", "completedAt": "..." },
    "specification": { "status": "complete", "startedAt": "...", "completedAt": "..." },
    "architecture": { "status": "complete", "startedAt": "...", "completedAt": "..." },
    "planning": { "status": "complete", "startedAt": "...", "completedAt": "..." },
    "implementation": { "status": "pending", "startedAt": null, "completedAt": null },
    "testing": { "status": "pending", "startedAt": null, "completedAt": null },
    "deployment": { "status": "pending", "startedAt": null, "completedAt": null },
    "complete": { "status": "pending", "startedAt": null, "completedAt": null }
  },
  "techStack": { ... },
  "tasks": [ ... ],
  "progress": { "total": N, "completed": 0, "inProgress": 0, "blocked": 0, "skipped": 0, "percentage": 0 },
  "decisions": [ ... ],
  "checkpoints": [],
  "history": [ { "timestamp": "...", "action": "project_initialized" } ],
  "config": {
    "autonomyLevel": "high",
    "checkpointFrequency": 5,
    "autoCommit": true,
    "maxParallelTasks": 3,
    "maxRetries": 3
  }
}
```
## Step 6: Present Summary
After initialization, display:
```markdown
## Project Initialized: [Name]
**Description:** [description]
### Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | [framework] |
| Backend | [framework] |
| Database | [database] |
| Testing | [tools] |
### Task Summary
- **Total Tasks:** N
- **Epics:** N
- **Stories:** N
- **Estimated Time:** ~Xh
### First 5 Tasks
1. [TASK-001] Setup project structure
2. [TASK-002] Initialize frontend
3. [TASK-003] Initialize backend
4. [TASK-004] Setup database
5. [TASK-005] Create base components
### Next Steps
Run `/orchestrator:continue` to begin autonomous development.
Run `/orchestrator:status` to check progress at any time.
```
## Important Notes
1. **State Directory Structure:**
   ```
   .claude/orchestrator/
   ├── spec/
   │   └── specification.md
   ├── plan/
   │   └── architecture.md
   └── state/
       ├── project.json
       └── tasks.json
   ```
2. **Quality Gates for Each Phase:**
   - Specification: All P0 features defined, acceptance criteria clear
   - Architecture: Stack decisions documented, no conflicts
   - Tasks: Each task <20 min, dependencies mapped, agents assigned
3. **Error Handling:**
   - If spec-writer fails, ask user for clarification
   - If architect fails, simplify tech stack
   - If task-planner fails, break down further manually
4. **User Approval:**
   - After specification: Show summary, ask for approval
   - After architecture: Show tech stack, ask for approval
   - After tasks: Show first 10 tasks, ask to proceed
