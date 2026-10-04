<div align="center">
  <h1>IIPS Academic Project Repository</h1>
  <p>Centralized project management and evaluation platform for the MCA (5 Years) Integrated program at IIPS DAVV.</p>
</div>

## Features

* **GitHub OAuth Registration:** Secure onboarding for students and faculty.
* **Repository Management:** Submit projects, link GitHub repositories, and track commits.
* **Guide Allocation:** Rule-based matching and coordinator approval workflows.
* **Rubric-Based Evaluation:** Standardized grading criteria for final submissions.
* **Longitudinal Records:** Track academic progress across all 10 semesters.

## Tech Stack

* **Frontend:** Next.js 15, React 19, Tailwind CSS, shadcn/ui
* **Backend:** Spring Boot 3.5, Spring Security (JWT), Spring Data JPA
* **Database:** PostgreSQL 17, Flyway Migrations
* **Auth:** Supabase + GitHub OAuth

## Getting Started

### Prerequisites

* Node.js 20+ and pnpm
* Java 21+
* PostgreSQL 17 (or a Supabase instance)

### Backend Setup

1. Copy the environment template:
   ```bash
   cp backend/.env.example backend/.env.local
   ```
2. Update the database credentials in `.env.local`.
3. Start the Spring Boot server:
   ```bash
   cd backend
   ./dev.sh
   ```

### Frontend Setup

1. Copy the environment template:
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```
2. Install dependencies and start the development server:
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```
3. Open `http://localhost:3000` in your browser.

## Documentation

Full Object-Oriented Analysis and Design (OOAD) artifacts are available in the `docs/` directory. Diagrams are built using Graphviz (`.dot`).

| Phase | Artifact |
|---|---|
| **Requirements** | [Problem Statement](docs/01-problem-statement.md), [SRS](docs/03-srs.md), [Use Cases](docs/05-use-case-model.md) |
| **Behavioral** | [Activity](docs/06-activity-diagram.md), [State Machine](docs/11-state-machine-diagram.md), [Sequence](docs/09-sequence-diagram.md) |
| **Structural** | [Class](docs/07-class-diagram.md), [Object](docs/08-object-diagram.md), [Component](docs/13-component-diagram.md) |
| **Database** | [ER Design](docs/15-database-design.md) |

## Development Guidelines

1. **Authentication:** The backend relies on JWTs generated from GitHub OAuth via Supabase. Local testing requires valid Supabase credentials in `.env.local`.
2. **Migrations:** Flyway automatically applies migrations located in `backend/src/main/resources/db/migration/` on application startup.
3. **Roles:** Default roles include `STUDENT`, `FACULTY`, `COORDINATOR`, and `ADMIN`. Role assignment requires coordinator approval after initial registration.

## License

MIT
