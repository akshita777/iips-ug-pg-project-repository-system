# IIPS UG-PG Academic Project Repository & Record Management System

## Roadmap

**Institution:** IIPS DAVV, Indore  
**Program:** BCA (Sem 1-6) + MCA (Sem 7-10)  
**Lab:** Object-Oriented Analysis & Design  
**Stack:** Next.js 15 + Spring Boot 3.5 + PostgreSQL 17 + Flyway + NextAuth + Spring Security JWT

---

## Phase 0: Repository & Docs Skeleton ✅

- [x] `roadmap.md` — this file
- [x] `README.md` — project overview
- [x] `docs/` — all 20 OOAD artifacts
- [x] `frontend/` — Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui
- [x] `backend/` — Spring Boot 3.5 + JPA + Flyway + Security
- [x] `.github/workflows/` — CI/CD
- [x] GitHub Issues + Milestones

---

## Phase 1: OOAD Artifacts 1-7 (Requirements & Modeling)

| # | Artifact | File | Status |
|---|----------|------|--------|
| 1 | Problem Statement | `docs/01-problem-statement.md` | TODO |
| 2 | Stakeholder Analysis | `docs/02-stakeholder-analysis.md` | TODO |
| 3 | SRS | `docs/03-srs.md` | TODO |
| 4 | Functional & Non-Functional Reqs | `docs/04-requirements.md` | TODO |
| 5 | Use Case Model | `docs/05-use-case-model.md` | TODO |
| 6 | Activity Diagram | `docs/06-activity-diagram.md` | TODO |
| 7 | Class Diagram | `docs/07-class-diagram.md` | TODO |

**Milestone:** `phase-1-requirements-modeling`

---

## Phase 2: OOAD Artifacts 8-14 (Design & Architecture)

| # | Artifact | File | Status |
|---|----------|------|--------|
| 8 | Object Diagram | `docs/08-object-diagram.md` | TODO |
| 9 | Sequence Diagram | `docs/09-sequence-diagram.md` | TODO |
| 10 | Communication Diagram | `docs/10-communication-diagram.md` | TODO |
| 11 | State Machine Diagram | `docs/11-state-machine-diagram.md` | TODO |
| 12 | Package Diagram | `docs/12-package-diagram.md` | TODO |
| 13 | Component Diagram | `docs/13-component-diagram.md` | TODO |
| 14 | Deployment Diagram | `docs/14-deployment-diagram.md` | TODO |

**Milestone:** `phase-2-design-architecture`

---

## Phase 3: DB, UI, Architecture & SDD

| # | Artifact | File | Status |
|---|----------|------|--------|
| 15 | Database Design (ER + Relational Schema) | `docs/15-database-design.md` | TODO |
| 16 | UI Mockups / Wireframes | `docs/16-ui-mockups.md` | TODO |
| 17 | Layered Architecture | `docs/17-layered-architecture.md` | TODO |
| 18 | Design Patterns | `docs/18-design-patterns.md` | TODO |
| 19 | Software Design Document (SDD) | `docs/19-sdd.md` | TODO |

**Milestone:** `phase-3-db-ui-architecture`

---

## Phase 4: Prototype & Final Deliverables

| # | Artifact | File | Status |
|---|----------|------|--------|
| 20 | Prototype | `frontend/` + `backend/` | TODO |
| 21 | GitHub Repository | this repo | TODO |
| 22 | Project Documentation | `docs/` + `README.md` | TODO |
| 23 | Final Presentation | `docs/presentation/` | TODO |

**Milestone:** `phase-4-prototype-deliverables`

---

## 10-Semester Lifecycle

```
Sem 1-5 (BCA): Profile building, synopsis, guide preference, minor projects
Sem 6 (BCA):   Final Project Submission → Evaluation → Viva
Sem 7-9 (MCA): Profile building, synopsis, guide preference, minor projects
Sem 10 (MCA):  Final Project Submission → Evaluation → Viva
```

---

## Tech Stack (Best Possible)

| Layer | Tech | Version | Reason |
|-------|------|---------|--------|
| Frontend | Next.js | 15.1+ | App Router, Server Actions, Vercel deploy |
| UI | Tailwind + shadcn/ui | latest | Rapid wireframe → prototype |
| Auth (FE) | NextAuth | v5 | GitHub OAuth + credentials, RBAC |
| Backend | Spring Boot | 3.5+ | Enterprise Java, OOAD mapping |
| ORM | Spring Data JPA | 3.5+ | Entity = Class Diagram 1:1 |
| DB | PostgreSQL | 17 | ACID, FKs, version history |
| Migrations | Flyway | 10+ | Versioned schema, reproducible |
| Auth (BE) | Spring Security + JWT | 6+ | Stateless RBAC |
| VCS | GitHub API | — | Repo linking, commits, PRs, issues |
| Storage | S3-compatible / local | — | Reports, PPTs, code zips |
| Diagrams | Mermaid | — | GitHub-native rendering |

---

## Design Patterns

| Pattern | Where | Why |
|---------|-------|-----|
| Layered Architecture | `controller/service/repository/entity` | Clean separation, OOAD traceability |
| Repository | Spring Data JPA | Abstraction over data access |
| Factory | Evaluation creation | Different evaluator types |
| Observer | Status notifications | Decouple status change from notification |
| Strategy | Guide allocation + grading | Swappable algorithms |
| Singleton | Spring beans | Default scope |
| Adapter | GitHub API service | Abstract VCS provider |
| Facade | VCS service layer | Simplify GitHub API complexity |

---

## Repo Structure

```
iips-ug-pg-project-repository-system/
├── .github/workflows/     # CI/CD
├── docs/                  # All 20 OOAD artifacts
├── frontend/              # Next.js 15
│   ├── app/
│   ├── components/
│   │   ├── auth/          # Login, register, OAuth
│   │   ├── dashboard/     # Role-based dashboards
│   │   ├── vcs/           # Commits, branches, PRs
│   │   ├── review/        # Code review workflow
│   │   ├── issues/        # Issue tracking
│   │   ├── wiki/          # Project documentation
│   │   ├── team/          # Team collaboration
│   │   └── analytics/     # Reports & metrics
│   ├── lib/
│   └── public/
├── backend/               # Spring Boot 3.5
│   ├── src/main/java/com/iips/pms/
│   │   ├── controller/
│   │   ├── service/
│   │   │   ├── vcs/       # GitHub API integration
│   │   │   ├── review/    # Code review
│   │   │   ├── analytics/ # Reporting
│   │   │   └── archive/   # Backup & archival
│   │   ├── repository/
│   │   ├── entity/
│   │   ├── dto/
│   │   ├── security/
│   │   └── config/
│   └── src/main/resources/
│       └── db/migration/
├── .gitignore
├── README.md
└── roadmap.md
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- Java 21+
- PostgreSQL 17+
- Docker (optional, for local DB)

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
./mvnw spring-boot:run
```

### Database
```bash
# Docker
docker run -d -p 5432:5432 -e POSTGRES_DB=pms -e POSTGRES_PASSWORD=postgres postgres:17
```

---

## License

MIT
