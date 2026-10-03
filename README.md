# IIPS UG-PG Academic Project Repository & Record Management System

**Institution:** IIPS DAVV, Indore  
**Program:** BCA (Sem 1-6) + MCA (Sem 7-10)  
**Lab:** Object-Oriented Analysis & Design

---

## Overview

A comprehensive academic project repository and record management system for IIPS DAVV, supporting the full 10-semester UG-PG lifecycle with formal project submissions at BCA (Sem 6) and MCA (Sem 10).

**Key Features:**
- Project submission with version control
- Guide allocation (rule-based + HOD approval)
- Evaluation management (rubric-based)
- Longitudinal student record (Sem 1-10)
- Role-based access (Student, Guide, Coordinator, Evaluator, Admin)

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, TypeScript, Tailwind, shadcn/ui |
| Backend | Spring Boot 3.5, Spring Data JPA, Spring Security JWT |
| Database | PostgreSQL 17, Flyway migrations |
| Auth | NextAuth (FE) + Spring Security JWT (BE) |
| Diagrams | Mermaid (GitHub-native) |

---

## Quick Start

### Prerequisites
- Node.js 20+
- Java 21+
- PostgreSQL 17+

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

### Database (Docker)
```bash
docker run -d -p 5432:5432 -e POSTGRES_DB=pms -e POSTGRES_PASSWORD=postgres postgres:17
```

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
