---
name: project-planning
description: Expert knowledge in project planning, requirements gathering, user stories, and scope management. Use when planning new projects or features.
allowed-tools: Read, Write, WebSearch
---

# Project Planning Skill

Comprehensive knowledge for planning software projects from ideation to execution.

## Planning Methodology

### 1. Discovery Phase

**Questions to Ask:**
- What problem are we solving?
- Who are the target users?
- What does success look like?
- What are the constraints?
- What's the timeline?

### 2. Requirements Gathering

**Requirement Types:**
- **Functional:** What the system must do
- **Non-Functional:** How well it must do it
- **Technical:** Implementation constraints
- **Business:** Organizational needs

### 3. User Story Format

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

### 4. Prioritization Framework

**MoSCoW Method:**
- **Must Have:** Critical for MVP
- **Should Have:** Important but not critical
- **Could Have:** Nice to have
- **Won't Have:** Out of scope (for now)

**Priority Levels:**
| Priority | Description | Timeline |
|----------|-------------|----------|
| P0 | Critical | Immediate |
| P1 | High | This sprint |
| P2 | Medium | Next sprint |
| P3 | Low | Backlog |

### 5. Estimation Techniques

**T-Shirt Sizing:**
| Size | Complexity | Time |
|------|------------|------|
| XS | Trivial | < 1 hour |
| S | Simple | 1-4 hours |
| M | Medium | 4-8 hours |
| L | Complex | 1-3 days |
| XL | Very Complex | > 3 days |

**Story Points (Fibonacci):**
1, 2, 3, 5, 8, 13, 21

### 6. Scope Management

**In Scope:**
- Explicitly defined features
- Agreed requirements
- Documented acceptance criteria

**Out of Scope:**
- Features deferred to future
- Explicitly excluded items
- Nice-to-haves beyond MVP

### 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Scope creep | High | High | Strict change control |
| Technical debt | Medium | Medium | Regular refactoring |
| Key person dependency | Medium | High | Documentation, pairing |

## Templates

### Project Brief Template
```markdown
# Project: [Name]

## Overview
[1-2 sentence description]

## Problem Statement
[What problem does this solve?]

## Goals
1. [Primary goal]
2. [Secondary goal]
3. [Tertiary goal]

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

### Epic Template
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
