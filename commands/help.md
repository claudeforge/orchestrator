---
description: Show orchestrator documentation and available commands
allowed-tools: Read
---
# Orchestrator: Help
Display comprehensive documentation for the Orchestrator.
## Output
```markdown
# Claude Orchestrator - Help
Autonomous Development System for Claude Code
## Quick Start
1. **Start a new project:**
   ```
   /orchestrator:start
   ```
   Follow the prompts to describe your project.
2. **Begin autonomous development:**
   ```
   /orchestrator:continue
   ```
   The orchestrator will execute tasks automatically.
3. **Check progress:**
   ```
   /orchestrator:status
   ```
   View current phase, completed tasks, and blockers.
---
## Commands
| Command | Description |
|---------|-------------|
| `/orchestrator:start` | Initialize a new project from an idea |
| `/orchestrator:continue` | Run autonomous development loop |
| `/orchestrator:status` | Show progress dashboard |
| `/orchestrator:tasks` | List all tasks with status |
| `/orchestrator:pause` | Pause after current task |
| `/orchestrator:resume` | Resume paused session |
| `/orchestrator:rollback <CP>` | Rollback to checkpoint |
| `/orchestrator:help` | Show this documentation |
---
## Development Lifecycle
```
┌─────────────┐
│  IDEATION   │ ← /orchestrator:start
└──────┬──────┘
       ▼
┌─────────────┐
│    SPEC     │ ← spec-writer agent
└──────┬──────┘
       ▼
┌─────────────┐
│ ARCHITECTURE│ ← architect agent
└──────┬──────┘
       ▼
┌─────────────┐
│  PLANNING   │ ← task-planner agent
└──────┬──────┘
       ▼
┌─────────────┐
│IMPLEMENTATION│ ← /orchestrator:continue (autonomous loop)
└──────┬──────┘
       ▼
┌─────────────┐
│  TESTING    │ ← test-engineer, security-auditor
└──────┬──────┘
       ▼
┌─────────────┐
│ DEPLOYMENT  │ ← devops-engineer
└─────────────┘
```
---
## Specialized Agents
| Agent | Expertise |
|-------|-----------|
| `orchestrator` | Main coordinator, state management |
| `spec-writer` | Requirements, user stories |
| `architect` | System design, tech stack |
| `task-planner` | Task breakdown, dependencies |
| `frontend-dev` | React, TypeScript, UI |
| `backend-dev` | Node.js, APIs, databases |
| `test-engineer` | Unit, integration, E2E tests |
| `code-reviewer` | Quality, best practices |
| `security-auditor` | Security, OWASP |
| `bug-fixer` | Error diagnosis, fixes |
---
## Quality Gates
Every task goes through:
1. ✓ TypeScript compilation
2. ✓ ESLint validation
3. ✓ Unit tests (if applicable)
4. ✓ Acceptance criteria check
---
## Error Recovery
The system automatically:
- Retries failed tasks (up to 3 times)
- Delegates errors to bug-fixer agent
- Creates checkpoints for rollback
- Logs all decisions for debugging
---
## State Files
```
.claude/orchestrator/
├── spec/
│   └── specification.md    # Project requirements
├── plan/
│   └── architecture.md     # System design
├── state/
│   ├── project.json        # Current state
│   └── tasks.json          # Task list
└── checkpoints/
    └── CP-XXX.json         # Rollback points
```
---
## Tips
- **Checkpoints:** Created every 5 tasks (configurable)
- **Parallel tasks:** Independent tasks run concurrently
- **Blockers:** Tasks failing 3x become blocked
- **Git commits:** Automatic after each feature
---
## Configuration
Edit `.claude/orchestrator/state/project.json` config:
```json
{
  "config": {
    "autonomyLevel": "high",     // low, medium, high, full
    "checkpointFrequency": 5,    // tasks per checkpoint
    "autoCommit": true,          // auto git commits
    "maxParallelTasks": 3,       // concurrent tasks
    "maxRetries": 3              // attempts before blocking
  }
}
```
---
## Need Help?
- GitHub: github.com/claudeforge/orchestrator
- Issues: github.com/claudeforge/orchestrator/issues
```
