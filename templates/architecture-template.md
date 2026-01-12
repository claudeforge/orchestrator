# Architecture Document: [Project Name]

## Overview

[Brief description of the system architecture and its main components]

## System Context

```
┌──────────────────────────────────────────────────────────┐
│                       CLIENTS                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                   │
│  │ Browser │  │ Mobile  │  │  CLI    │                   │
│  └────┬────┘  └────┬────┘  └────┬────┘                   │
└───────┼────────────┼────────────┼────────────────────────┘
        │            │            │
        ▼            ▼            ▼
┌──────────────────────────────────────────────────────────┐
│                    API GATEWAY                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Rate Limiting │ Auth │ Routing │ Logging          │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Auth Service│  │ API Service │  │Worker Service│
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│                     DATA LAYER                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │PostgreSQL│  │  Redis   │  │    S3    │               │
│  │ (Primary)│  │ (Cache)  │  │ (Files)  │               │
│  └──────────┘  └──────────┘  └──────────┘               │
└──────────────────────────────────────────────────────────┘
```

## Tech Stack

### Frontend
| Category | Technology | Version | Rationale |
|----------|------------|---------|-----------|
| Framework | React | 19.x | Large ecosystem, team familiarity |
| Language | TypeScript | 5.x | Type safety, better DX |
| Build Tool | Vite | 7.x | Fast builds, HMR |
| Styling | Tailwind CSS | 4.x | Utility-first, rapid development |
| Components | shadcn/ui | latest | Accessible, customizable |
| State | Zustand | 5.x | Simple, performant |
| Server State | TanStack Query | 5.x | Caching, sync |
| Forms | React Hook Form | 7.x | Performance, validation |
| Router | React Router | 7.x | Industry standard |

### Backend
| Category | Technology | Version | Rationale |
|----------|------------|---------|-----------|
| Runtime | Node.js | 22.x | LTS, ecosystem |
| Framework | Hono | 4.x | Fast, TypeScript-first |
| Language | TypeScript | 5.x | Type safety |
| Validation | Zod | 3.x | Schema validation |
| Auth | JWT | - | Stateless, scalable |

### Database
| Category | Technology | Version | Rationale |
|----------|------------|---------|-----------|
| Primary | PostgreSQL | 16.x | ACID, reliability |
| ORM | Drizzle | latest | Type-safe, performant |
| Cache | Redis | 7.x | Speed, pub/sub |

### Testing
| Category | Technology | Rationale |
|----------|------------|-----------|
| Unit | Vitest | Fast, Vite integration |
| Component | Testing Library | User-centric |
| E2E | Playwright | Cross-browser |
| API | Hono test client | Built-in |

### DevOps
| Category | Technology | Rationale |
|----------|------------|-----------|
| CI/CD | GitHub Actions | Integration |
| Container | Docker | Portability |
| Hosting | Vercel | Simplicity |
| Database | Neon | Serverless PostgreSQL |

## Architecture Decision Records

### ADR-001: [Decision Title]

**Status:** Accepted | Rejected | Superseded

**Context:**
[What is the issue that we're seeing that is motivating this decision?]

**Decision:**
[What is the change that we're proposing?]

**Rationale:**
[Why is this the best choice among the alternatives?]

**Alternatives Considered:**
1. [Alternative 1] - [Reason rejected]
2. [Alternative 2] - [Reason rejected]

**Consequences:**
- Positive: [Benefits]
- Negative: [Drawbacks]

---

### ADR-002: [Decision Title]
[Same format]

## Data Model

```
┌──────────────────────────────────────────────────────────┐
│                      DATA MODEL                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐       ┌──────────────┐                │
│  │    users     │       │   sessions   │                │
│  ├──────────────┤       ├──────────────┤                │
│  │ id (PK)      │──────<│ user_id (FK) │                │
│  │ email        │       │ token        │                │
│  │ password     │       │ expires_at   │                │
│  │ created_at   │       │ created_at   │                │
│  └──────────────┘       └──────────────┘                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Entity Definitions

#### users
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| name | VARCHAR(100) | NOT NULL | Display name |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |

## API Design

### Authentication
```
POST   /api/v1/auth/register    # Register new user
POST   /api/v1/auth/login       # Login
POST   /api/v1/auth/logout      # Logout
POST   /api/v1/auth/refresh     # Refresh token
```

### Resources
```
GET    /api/v1/[resource]       # List
GET    /api/v1/[resource]/:id   # Get one
POST   /api/v1/[resource]       # Create
PATCH  /api/v1/[resource]/:id   # Update
DELETE /api/v1/[resource]/:id   # Delete
```

## Security

### Authentication
- JWT access tokens (15min expiry)
- Refresh tokens (7 day expiry)
- Tokens stored in httpOnly cookies

### Authorization
- Role-based access control (RBAC)
- Resource-level permissions

### Data Protection
- Passwords hashed with Argon2
- Sensitive data encrypted (AES-256)
- TLS 1.3 for all traffic

### Headers
- Content-Security-Policy
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security

## Directory Structure

```
project/
├── apps/
│   ├── web/                    # Frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── stores/
│   │   │   ├── lib/
│   │   │   └── types/
│   │   └── package.json
│   └── api/                    # Backend
│       ├── src/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── db/
│       │   ├── middleware/
│       │   └── utils/
│       └── package.json
├── packages/
│   └── shared/                 # Shared code
├── docker-compose.yml
└── package.json
```

## Deployment

### Environments
| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | localhost:3000 | Local development |
| Staging | staging.app.com | Pre-production |
| Production | app.com | Live |

### CI/CD Pipeline
1. Push to branch → Run tests
2. PR to main → Run all checks
3. Merge to main → Deploy to staging
4. Tag release → Deploy to production

---

*Generated by Claude Orchestrator*
