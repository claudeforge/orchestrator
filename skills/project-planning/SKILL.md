---
name: project-planning
description: "Creates project briefs, writes user stories with acceptance criteria, breaks epics into tasks, estimates effort with T-shirt sizing, and defines scope boundaries. Use when planning a new project, writing a PRD, creating a roadmap, defining MVP scope, or breaking features into user stories."
allowed-tools: Read, Write, WebSearch
---

# Project Planning Skill

## Workflow

1. **Discover** — Gather problem, users, constraints, success metrics
2. **Scope** — Define in-scope vs out-of-scope; apply MoSCoW prioritization
3. **Break down** — Write user stories with acceptance criteria; group into epics
4. **Estimate** — T-shirt size each story; flag XL items for further breakdown
5. **Assess risk** — Identify top risks and mitigations
6. **Validate** — Confirm scope with stakeholder before proceeding to architecture

## User Story Format

```markdown
**As a** [type of user]
**I want** [goal/desire]
**So that** [benefit/value]

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Priority:** P0/P1/P2
**Estimate:** S/M/L/XL
```

## Prioritization

**MoSCoW:** Must Have (MVP-critical) > Should Have > Could Have > Won't Have (deferred).

| Priority | Description | Timeline |
|----------|-------------|----------|
| P0 | Critical | Immediate |
| P1 | High | This sprint |
| P2 | Medium | Next sprint |
| P3 | Low | Backlog |

## Estimation

| Size | Complexity | Time |
|------|------------|------|
| XS | Trivial | < 1 hour |
| S | Simple | 1-4 hours |
| M | Medium | 4-8 hours |
| L | Complex | 1-3 days |
| XL | Very Complex | > 3 days — break down further |

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Scope creep | High | High | Strict change control |
| Technical debt | Medium | Medium | Regular refactoring |
| Key person dependency | Medium | High | Documentation, pairing |

## Templates

### Project Brief

```markdown
# Project: [Name]

## Overview
[1-2 sentence description]

## Problem Statement
[What problem does this solve?]

## Goals
1. [Primary goal]
2. [Secondary goal]

## Success Metrics
- [Metric 1]: [Target]
- [Metric 2]: [Target]

## Scope
### In Scope
- [Feature 1]
- [Feature 2]

### Out of Scope
- [Excluded 1]
- [Excluded 2]

## Timeline
- Phase 1: [Date]
- Phase 2: [Date]
- Launch: [Date]
```

### Epic

```markdown
# Epic: [Name]

## Description
[What this epic accomplishes]

## User Stories
- [ ] US-001: [Story]
- [ ] US-002: [Story]

## Acceptance Criteria
- [ ] [Criterion]

## Dependencies
- [Dependency 1]
```
