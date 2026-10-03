# IIPS UG-PG Academic Project Repository & Record Management System

**Institution:** IIPS DAVV, Indore  
**Program:** MCA Integrated (2022-2027)  
**Lab:** Object-Oriented Analysis & Design

---

## Overview

A comprehensive academic project repository and record management system for IIPS DAVV, supporting the full 10-semester UG-PG lifecycle with formal project submissions at BCA (Sem 6) and MCA (Sem 10).

**Key Features:**
- GitHub OAuth authentication
- Project submission with version control
- GitHub repository linking (commits, branches, PRs, issues)
- Code review workflow
- Guide allocation (rule-based + HOD approval)
- Evaluation management (rubric-based)
- Team collaboration
- Project wiki/documentation
- Analytics & reporting
- Backup & archival
- Longitudinal student record (Sem 1-10)
- Role-based access (Student, Guide, Coordinator, Evaluator, Admin)

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, TypeScript, Tailwind, shadcn/ui |
| Backend | Spring Boot 3.5, Spring Data JPA, Spring Security JWT |
| Database | PostgreSQL 17, Flyway migrations |
| Auth | NextAuth GitHub OAuth (FE) + Spring Security JWT (BE) |
| VCS | GitHub API (repo linking, commits, PRs, issues) |
| Diagrams | Mermaid (GitHub-native) |

---

## Quick Start

### Prerequisites
- Node.js 20+ and pnpm
- Java 21+
- PostgreSQL 17+ (or a Supabase project, see below)

### Backend

Secrets live in `backend/.env.local`, which git ignores. Fill it once from
`backend/.env.example`, then every session is a single command:

```bash
cd backend
./dev.sh
```

`dev.sh` sources `.env.local` and runs `mvn spring-boot:run` on port 8080.

### Frontend
```bash
cd frontend
pnpm install
pnpm dev
```

### Database

Two ways to run it:

**Supabase (default for this project).** Set `DB_HOST`, `DB_PASSWORD`,
`STORAGE_TYPE=supabase`, `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in
`backend/.env.local`. No local database needed. Use the direct connection on
port 5432, not the pooler, so Flyway migrations V1 to V8 apply cleanly.

**Local (offline development).** Leave those unset and start Postgres yourself:
```bash
docker run -d -p 5432:5432 -e POSTGRES_DB=pms -e POSTGRES_PASSWORD=postgres postgres:17
```

Migrations run automatically on backend boot either way.

---

## Documentation

All OOAD artifacts are in [`docs/`](./docs/):

| # | Artifact | File |
|---|----------|------|
| 1 | Problem Statement | [docs/01-problem-statement.md](./docs/01-problem-statement.md) |
| 2 | Stakeholder Analysis | [docs/02-stakeholder-analysis.md](./docs/02-stakeholder-analysis.md) |
| 3 | SRS | [docs/03-srs.md](./docs/03-srs.md) |
| 4 | Functional & Non-Functional Reqs | [docs/04-requirements.md](./docs/04-requirements.md) |
| 5 | Use Case Model | [docs/05-use-case-model.md](./docs/05-use-case-model.md) |
| 6 | Activity Diagram | [docs/06-activity-diagram.md](./docs/06-activity-diagram.md) |
| 7 | Class Diagram | [docs/07-class-diagram.md](./docs/07-class-diagram.md) |
| 8 | Object Diagram | [docs/08-object-diagram.md](./docs/08-object-diagram.md) |
| 9 | Sequence Diagram | [docs/09-sequence-diagram.md](./docs/09-sequence-diagram.md) |
| 10 | Communication Diagram | [docs/10-communication-diagram.md](./docs/10-communication-diagram.md) |
| 11 | State Machine Diagram | [docs/11-state-machine-diagram.md](./docs/11-state-machine-diagram.md) |
| 12 | Package Diagram | [docs/12-package-diagram.md](./docs/12-package-diagram.md) |
| 13 | Component Diagram | [docs/13-component-diagram.md](./docs/13-component-diagram.md) |
| 14 | Deployment Diagram | [docs/14-deployment-diagram.md](./docs/14-deployment-diagram.md) |
| 15 | Database Design | [docs/15-database-design.md](./docs/15-database-design.md) |
| 16 | UI Mockups | [docs/16-ui-mockups.md](./docs/16-ui-mockups.md) |
| 17 | Layered Architecture | [docs/17-layered-architecture.md](./docs/17-layered-architecture.md) |
| 18 | Design Patterns | [docs/18-design-patterns.md](./docs/18-design-patterns.md) |
| 19 | SDD | [docs/19-sdd.md](./docs/19-sdd.md) |
| 20 | Prototype | [`frontend/`](./frontend/) + [`backend/`](./backend/) |

---

## Roadmap

See [`roadmap.md`](./roadmap.md) for the full development plan.

---

## License

MIT
