# Claude Orchestrator

**Autonomous Development System for Claude Code**

Transform ideas into production-ready applications with zero manual intervention.

```
Spec → Plan → Tasks → 100% Working App
```

## Installation

```bash
# Add the marketplace
/plugin marketplace add claudeforge/orchestrator

# Install the plugin
/plugin install orchestrator@claudeforge-orchestrator
```

## Features

- **Multi-Agent Orchestration** - 12+ specialized agents working in coordination
- **Autonomous Development Loop** - Tasks executed automatically with quality gates
- **Self-Healing** - Automatic error detection and recovery (up to 3 retries)
- **Quality Gates** - Automated checks at every stage (TypeScript, ESLint, tests)
- **State Persistence** - Resume development from any checkpoint
- **Parallel Execution** - Independent tasks run concurrently

## Quick Start

### 1. Start a New Project

```
/orchestrator:start
```

Follow the prompts to describe your project idea. The orchestrator will:
- Generate a detailed specification
- Design the system architecture
- Create atomic, executable tasks

### 2. Begin Autonomous Development

```
/orchestrator:continue
```

The orchestrator will automatically:
- Pick the next task based on dependencies
- Delegate to the appropriate specialized agent
- Verify completion with quality gates
- Handle errors with self-healing
- Create checkpoints for progress tracking

### 3. Monitor Progress

```
/orchestrator:status
```

View:
- Current phase and progress percentage
- Running and blocked tasks
- Recent activity
- Checkpoints

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
| `/orchestrator:help` | Show documentation |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR CORE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  COMMANDS (/orchestrator:*)                                         │
│  └── start, continue, status, tasks, pause, rollback        │
│                                                             │
│  BRAIN (Orchestrator Agent)                                 │
│  ├── State Machine (6 phases)                               │
│  ├── Decision Engine                                        │
│  ├── Error Recovery (3 retries)                             │
│  └── Quality Gates                                          │
│                                                             │
│  AGENT POOLS                                                │
│  ├── PLANNING: spec-writer, architect, task-planner         │
│  ├── EXECUTION: frontend-dev, backend-dev, database-expert  │
│  └── QUALITY: test-engineer, code-reviewer, security-auditor│
│                                                             │
│  SKILLS LIBRARY                                             │
│  └── project-planning, error-recovery, frontend-patterns... │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Development Lifecycle

```
IDEATION → SPECIFICATION → ARCHITECTURE → PLANNING → IMPLEMENTATION → TESTING → DEPLOYMENT
```

### Phase 1: Ideation → Specification
- User describes their idea
- `spec-writer` agent creates detailed requirements
- Output: `specification.md`

### Phase 2: Specification → Architecture
- `architect` agent designs the system
- Tech stack selection with rationale (ADRs)
- Output: `architecture.md`

### Phase 3: Architecture → Planning
- `task-planner` agent breaks down work
- Atomic tasks (15-20 min each)
- Dependencies mapped
- Output: `tasks.json`

### Phase 4: Implementation (Autonomous Loop)
```
PICK TASK → DELEGATE → EXECUTE → VERIFY → COMMIT
    ↑                                    │
    └────────────────────────────────────┘
```

### Phase 5: Testing
- Integration tests
- E2E tests
- Security audit
- Performance analysis

### Phase 6: Deployment
- Build optimization
- Containerization
- CI/CD setup
- Production deployment

## Specialized Agents

| Agent | Expertise | Model |
|-------|-----------|-------|
| `orchestrator` | Main coordinator, state management | opus |
| `spec-writer` | Requirements, user stories | opus |
| `architect` | System design, tech stack | opus |
| `task-planner` | Task breakdown, dependencies | opus |
| `frontend-dev` | React 19, TypeScript, Tailwind | opus |
| `backend-dev` | Node.js, Hono, APIs | opus |
| `database-expert` | PostgreSQL, Drizzle, schemas | opus |
| `test-engineer` | Vitest, Playwright, testing | opus |
| `code-reviewer` | Quality, best practices | opus |
| `security-auditor` | OWASP, vulnerabilities | opus |
| `bug-fixer` | Error diagnosis, fixes | opus |
| `documentation` | READMEs, API docs | opus |
| `devops-engineer` | CI/CD, Docker, deployment | opus |

## Quality Gates

Every task passes through:

1. **TypeScript Check** - `npx tsc --noEmit`
2. **Lint Check** - `npx eslint . --max-warnings 0`
3. **Unit Tests** - `npm test`
4. **Acceptance Criteria** - Verified by agent

## Error Recovery

```
ERROR DETECTED
     ↓
CLASSIFY (syntax, type, runtime, build, test)
     ↓
ATTEMPT FIX (auto-fix or delegate to bug-fixer)
     ↓
VERIFY (run quality gates)
     ↓
SUCCESS? → Continue
     ↓
RETRY (up to 3 times)
     ↓
BLOCKED → Escalate to user
```

## State Management

Project state is persisted in `.claude/orchestrator/`:

```
.claude/orchestrator/
├── spec/
│   └── specification.md     # Project requirements
├── plan/
│   └── architecture.md      # System design
├── state/
│   ├── project.json         # Current state
│   └── tasks.json           # Task list
└── checkpoints/
    └── CP-XXX.json          # Rollback points
```

## Configuration

Edit `state/project.json` config section:

```json
{
  "config": {
    "autonomyLevel": "high",
    "checkpointFrequency": 5,
    "autoCommit": true,
    "maxParallelTasks": 3,
    "maxRetries": 3
  }
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `autonomyLevel` | "high" | How autonomous (low/medium/high/full) |
| `checkpointFrequency` | 5 | Tasks per checkpoint |
| `autoCommit` | true | Automatic git commits |
| `maxParallelTasks` | 3 | Concurrent task limit |
| `maxRetries` | 3 | Attempts before blocking |

## Tech Stack Expertise

The orchestrator has built-in expertise for:

**Frontend:**
- React 19, TypeScript 5.x, Vite 7
- Tailwind CSS 4, shadcn/ui
- Zustand, TanStack Query
- React Hook Form, Zod

**Backend:**
- Node.js 22, Hono
- PostgreSQL, Drizzle ORM
- JWT authentication
- Redis caching

**Testing:**
- Vitest, Testing Library
- Playwright (E2E)
- MSW (API mocking)

**DevOps:**
- GitHub Actions
- Docker
- Vercel deployment

## Project Structure

```
orchestrator/
├── commands/           # Slash commands (/orchestrator:*)
│   ├── start.md
│   ├── continue.md
│   ├── status.md
│   └── ...
├── agents/             # Specialized subagents
│   ├── orchestrator.md
│   ├── spec-writer.md
│   ├── frontend-dev.md
│   └── ...
├── skills/             # Knowledge packages
│   ├── project-planning/
│   ├── error-recovery/
│   ├── frontend-patterns/
│   └── ...
├── scripts/            # Automation
│   ├── core/
│   ├── hooks/
│   └── quality/
├── templates/          # Reusable templates
├── CLAUDE.md           # Project context
└── README.md           # This file
```

## Tips

- **Checkpoints** are created every 5 tasks (configurable)
- **Parallel execution** runs independent tasks concurrently
- **Blocked tasks** don't stop progress on other tasks
- **Git commits** follow conventional commit format

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

---

**Repository:** [github.com/claudeforge/orchestrator](https://github.com/claudeforge/orchestrator)

Built with Claude Code
