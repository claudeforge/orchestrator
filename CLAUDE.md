# Claude Orchestrator

Autonomous Development Orchestrator for Claude Code. This system transforms ideas into production-ready applications through a multi-agent pipeline with zero manual intervention.

## Project Vision

**Spec → Plan → Tasks → 100% Working App**

From initial concept to fully tested, documented, and deployed application using AI agents working in coordination.

## Installation

```bash
# Add the marketplace
/plugin marketplace add claudeforge/orchestrator

# Install the plugin
/plugin install orchestrator@claudeforge-orchestrator
```

## Architecture Overview

```
ORCHESTRATOR CORE
├── COMMAND INTERFACE (/orchestrator:*)
│   └── start, continue, status, tasks, pause, rollback
├── BRAIN (Orchestrator Agent - Opus)
│   ├── State Machine (6 phases)
│   ├── Decision Engine
│   ├── Error Recovery (3 retries)
│   └── Quality Gates
├── AGENT POOLS
│   ├── PLANNING: spec-writer, architect, task-planner
│   ├── EXECUTION: frontend-dev, backend-dev, database-expert
│   └── QUALITY: test-engineer, code-reviewer, security-auditor
└── SKILLS LIBRARY
    └── project-planning, error-recovery, frontend-patterns, etc.
```

## Development Lifecycle

1. **IDEATION → SPECIFICATION**: User idea → Detailed spec
2. **SPECIFICATION → ARCHITECTURE**: Spec → Tech stack, system design
3. **ARCHITECTURE → TASKS**: Design → Atomic, executable tasks
4. **IMPLEMENTATION**: Autonomous task execution with quality gates
5. **TESTING**: Integration, E2E, security, performance audits
6. **DEPLOYMENT**: Build, containerize, deploy, monitor

## Key Commands

| Command | Description |
|---------|-------------|
| `/orchestrator:start` | Start new project from idea |
| `/orchestrator:continue` | Resume autonomous development |
| `/orchestrator:status` | Show progress dashboard |
| `/orchestrator:tasks` | List all tasks with status |
| `/orchestrator:pause` | Pause after current task |
| `/orchestrator:rollback` | Revert to checkpoint |

## Directory Structure

```
orchestrator/
├── .claude-plugin/    # Plugin configuration
│   ├── marketplace.json
│   ├── plugin.json
│   └── hooks.json
├── commands/          # Slash commands (/orchestrator:*)
├── agents/            # Specialized subagents
├── skills/            # Knowledge packages
├── scripts/
│   ├── core/         # State management, scheduling
│   ├── hooks/        # Lifecycle automation
│   └── quality/      # Quality check scripts
└── templates/         # Reusable templates
```

## State Management

Project state is stored in `.claude/orchestrator/state/project.json`:
- Current phase (ideation → delivery)
- Tech stack decisions
- Task list with status
- Progress metrics
- Checkpoint history

## Agent Delegation

The orchestrator delegates tasks to specialized agents:

| Task Type | Agent | Model |
|-----------|-------|-------|
| Specifications | spec-writer | opus |
| Architecture | architect | opus |
| Task breakdown | task-planner | opus |
| Frontend code | frontend-dev | opus |
| Backend code | backend-dev | opus |
| Tests | test-engineer | opus |
| Code review | code-reviewer | opus |
| Bug fixes | bug-fixer | opus |

## Quality Gates

Automated checks at every stage:
- **Per-Task**: TypeScript compiles, ESLint passes, unit tests pass
- **Per-Feature**: Integration tests, no regression
- **Pre-Delivery**: E2E tests, security audit, performance check

## Error Recovery Protocol

1. **Classify Error**: syntax, type, runtime, test, dependency
2. **Auto-Fix Attempt**: lint --fix, type fixes, dependency install
3. **Delegate to bug-fixer**: Complex errors go to specialized agent
4. **Escalate After 3 Failures**: Ask user for intervention

## Tech Stack Expertise

The system has built-in expertise for:

**Frontend**: React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Zustand
**Backend**: Node.js, Hono, Drizzle ORM, PostgreSQL
**Testing**: Vitest, Testing Library, Playwright
**DevOps**: GitHub Actions, Docker, Vercel/AWS

## Important Notes

- State files in `.claude/orchestrator/` are gitignored (user-specific)
- Each agent has restricted tool access for safety
- Checkpoints are created every 5 tasks (configurable)
- Git commits follow conventional commit format
