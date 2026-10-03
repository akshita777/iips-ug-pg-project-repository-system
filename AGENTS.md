# AGENTS.md

## Workflow

1. **Research first.** Read the issue, related docs, and existing code before writing anything. Understand the full context.
2. **Implement.** Write code, make frequent commits to keep history safe.
3. **Leave blockers to the user.** If something cannot be implemented or a command cannot run, stop and ask the user.
4. **PR from fork.** Fork this repo, set fork as `origin`, set this repo as `upstream`. Open PR from fork to upstream.
5. **Human touch.** All PRs, comments, and docs must read naturally. No AI feel. No em dashes.

## Git Setup

```bash
# Fork on GitHub, then:
git remote add upstream https://github.com/animishraa05/iips-ug-pg-project-repository-system.git
git remote add origin https://github.com/<your-username>/iips-ug-pg-project-repository-system.git
```

## Commands

### Frontend (`frontend/`)
```bash
npm install
npm run dev        # dev server :3000
npm run lint       # ESLint
npm run build      # production build
```

### Backend (`backend/`)
```bash
./mvnw spring-boot:run    # dev server :8080
./mvnw verify             # compile + test
./mvnw test               # tests only
```

### Database
```bash
docker run -d -p 5432:5432 -e POSTGRES_DB=pms -e POSTGRES_PASSWORD=postgres postgres:17
```

### CI Order
`lint -> typecheck -> test` (enforced in `.github/workflows/ci.yml`)

## Architecture

- **Frontend:** Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui, NextAuth (GitHub OAuth)
- **Backend:** Spring Boot 3.5, Spring Data JPA, Spring Security JWT, Flyway
- **DB:** PostgreSQL 17
- **VCS:** GitHub API integration (repo linking, commits, PRs, issues)

### Backend Package Layout
```
com.iips.pms
├── controller/     # REST endpoints
├── service/        # Business logic (vcs/, review/, analytics/, archive/)
├── repository/     # Spring Data JPA
├── entity/         # JPA entities (User hierarchy: Student, Faculty)
├── dto/            # Request/response objects
├── security/       # JWT, RBAC
└── config/         # Spring config
```

### Frontend Layout
```
frontend/
├── app/            # App Router pages
├── components/     # auth/, dashboard/, vcs/, review/, issues/, wiki/, team/, analytics/
├── lib/            # api.ts, utils.ts
└── public/
```

## Key Conventions

- JPA entities map 1:1 to Class Diagram in `docs/07-class-diagram.md`
- Flyway migrations in `backend/src/main/resources/db/migration/`
- All diagrams are Mermaid (render on GitHub)
- Issues tracked on GitHub with milestones (phase-1 through phase-4)
- Labels: `ooad`, `docs`, `prototype`, `srs`, `diagram`, `db`, `ui`, `backend`, `frontend`, `security`, `testing`, `devops`, `design`

## Environment Variables

See `frontend/.env.example` and `backend/src/main/resources/application.yml` for required env vars.

## Never Push

`.opencode/`, `AGENTS.md`, `knowledge/`, `*.plan.md` (already in `.gitignore`)
