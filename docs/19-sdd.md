# 19. Software Design Document (SDD)

## 19.1 Introduction

This document is the technical reference for building and running the IIPS Project Portal. It states the architecture, the module boundaries, the exact API surface, and the security, deployment, and testing positions. Anything tagged Planned is designed but not yet built. Related reading: the requirements in `docs/03-srs.md`, the layer rules in `docs/17-layered-architecture.md`, and the database in `docs/15-database-design.md`.

**Version:** 1.0
**Date:** October 2026

## 19.2 System Architecture

| Piece | Choice | Status |
|-------|--------|--------|
| Frontend | Next.js 15 App Router with TypeScript and Tailwind | Live |
| UI kit | Institute formal components in `frontend/components/ui` | Live |
| Backend | Spring Boot 3.5 with plain Java, no Lombok | Live |
| Data access | Spring Data JPA repositories | Live |
| Database | PostgreSQL 17, schema owned by Flyway | Live |
| Auth | Spring Security with JWT bearer tokens and role checks | Live |
| Frontend sessions | Token storage with refresh retry in the API client | Live |
| GitHub OAuth | NextAuth with GitHub provider | Planned, issue 35 |
| File storage | Local disk in development, S3 compatible store in production | Live local, S3 Planned |
| API docs | Springdoc OpenAPI served from the backend | Live |

## 19.3 Module Design

### 19.3.1 Authentication Module (Live)

Files: `security/JwtUtil`, `security/JwtAuthFilter`, `security/CustomUserDetailsService`, `security/SecurityConfig`, `service/AuthService`, `controller/AuthController`.

Registration rejects duplicate emails, hashes passwords with bcrypt, creates the correct account subtype for the requested role, and returns an access token plus a refresh token. Login authenticates through the authentication manager and returns fresh tokens. Refresh verifies the refresh token and issues a new access token. Public paths are limited to `/api/v1/auth/**` and `/error`. Admin, allocation, and evaluation paths require their roles. Everything else requires authentication.

### 19.3.2 Project Module (Live)

Files: `service/ProjectService`, `controller/ProjectController`, `entity/Project`, `entity/SubmissionVersion`, `repository/ProjectRepository`, `repository/SubmissionVersionRepository`.

Students create projects that start in Draft. Submitting moves a Draft or returned project to Submitted. The service rejects creation by non students and submission from any other state. Version records are append only. Version upload endpoints and the GitHub linking service are live in `VersionService` and `RepositoryService`, so the module covers the full lifecycle.

### 19.3.3 Guide Allocation Module (Live)

Preference intake, draft allocation from preferences and capacity, coordinator confirm or adjust. Entities, tables, service, and controller all live: `GuideAllocation`, `guide_allocations`, `AllocationService`, `AllocationController`. The Strategy design from `docs/18-design-patterns.md` is implemented through `AllocationStrategy` and `CapacityBalancingStrategy`. Notifications on confirm fire through the project status event pipeline.

### 19.3.4 Evaluation Module (Live)

Rubric based grading with marks plus feedback, evaluator assignment listing, and coordinator visibility. Entities, tables, service, and controller all live: `Evaluation`, `Rubric`, `evaluations`, `rubrics`, `EvaluationService`, `EvaluationController`.

### 19.3.5 Notification Module (Live)

Status change events deliver in app notifications through the Observer design from `docs/18-design-patterns.md`. `ProjectStatusEvent` is published by `ProjectService` and consumed by `NotificationService`. Email delivery is still Planned.

## 19.4 API Design

Base URL: `/api/v1`. All endpoints except the public auth ones expect `Authorization: Bearer <token>`.

### Live Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register with name, email, password, role | Public |
| POST | `/auth/login` | Log in and receive tokens | Public |
| POST | `/auth/refresh` | Exchange refresh token for access token | Public with valid refresh token |
| GET | `/projects` | List projects | Authenticated |
| POST | `/projects` | Create project as the calling student | Student |
| GET | `/projects/{id}` | Read one project | Authenticated |
| POST | `/projects/{id}/submit` | Move project to Submitted | Student |
| POST | `/projects/{id}/versions` | Upload a new file version | Student |
| GET | `/projects/{id}/versions` | List version history | Authenticated |
| GET | `/projects/{id}/export` | Download project export ZIP | Authenticated |
| POST | `/projects/{id}/review` | Move project to Under Review | Faculty, Coordinator, Admin |
| POST | `/projects/{id}/approve` | Approve project | Faculty, Coordinator, Admin |
| POST | `/projects/{id}/reject` | Reject project | Faculty, Coordinator, Admin |
| GET | `/allocations` | List allocations | Coordinator, Admin, or own rows |
| POST | `/allocations/suggest` | Draft allocation from preferences | Coordinator |
| POST | `/allocations/confirm` | Confirm adjusted allocation | Coordinator |
| POST | `/allocations/override` | Override allocation with faculty id | Coordinator |
| POST | `/allocations/preferences` | Save ranked preferences | Student |
| GET | `/evaluations/assigned` | Evaluations assigned to the caller | Evaluator, Coordinator, Admin |
| POST | `/evaluations` | Submit marks and feedback | Evaluator, Coordinator, Admin |
| GET | `/evaluations/rubrics` | List rubrics | Authenticated |
| POST | `/evaluations/rubrics` | Create rubric with criteria | Evaluator, Coordinator, Admin |
| GET | `/users` | List accounts | Admin |
| PATCH | `/users/{id}/role` | Change a user role | Admin |
| GET | `/analytics/summary` | Project, evaluation, and guide load counts | Coordinator, Admin |
| GET | `/notifications` | List inbox | Authenticated |
| GET | `/notifications/unread-count` | Unread count for badge | Authenticated |
| POST | `/notifications/{id}/read` | Mark one read | Authenticated |
| GET | `/projects/{id}/repository` | Get linked repo | Authenticated |
| POST | `/projects/{id}/repository/link` | Link a GitHub repo | Student owner |
| POST | `/projects/{id}/repository/sync` | Pull commits from GitHub | Student owner |
| GET | `/projects/{id}/repository/commits` | Stored commits | Authenticated |
| GET | `/projects/{id}/repository/branches` | Live branches from GitHub | Authenticated |
| GET | `/projects/{id}/reviews` | List code reviews | Authenticated |
| POST | `/projects/{id}/reviews` | Post a code review | Faculty, Coordinator, Admin |
| GET | `/projects/{id}/team` | List team | Authenticated |
| POST | `/projects/{id}/team` | Add member | Student owner |
| DELETE | `/projects/{id}/team/{memberId}` | Remove member | Student owner |
| GET | `/projects/{id}/wiki` | List wiki pages | Authenticated |
| PUT | `/projects/{id}/wiki` | Save a wiki page | Authenticated |
| DELETE | `/projects/{id}/wiki/{pageId}` | Delete a wiki page | Authenticated |

Error responses share one shape, `{ "error": "plain words" }`, produced by `GlobalExceptionHandler`. Validation failures return 400, broken business rules return 409, unknown ids return 404 through `ResourceNotFoundException`, and bad credentials return 401.

## 19.5 Security Design

- HTTPS terminates all traffic in every environment beyond local development.
- Passwords are hashed with bcrypt. Raw passwords never reach the database or logs.
- Access tokens live 15 minutes, refresh tokens live 7 days. Refresh rotation on use is a planned hardening step.
- Five roles gate endpoints in `SecurityConfig`: Student, Faculty, Coordinator, Evaluator, Admin. Method security is enabled for finer checks as services grow.
- Input validation runs on DTOs with Bean Validation and on forms with Zod. JPA uses parameterized queries throughout, and React escapes rendered content by default.
- CORS allows only the frontend origin with credentials enabled. Login attempts are rate limited per IP to 10 per minute.
- Known gaps before production traffic: no refresh token reuse detection, no upload scanning. These are tracked hardening tasks.

## 19.6 Deployment Strategy

| Environment | Frontend | Backend | Database |
|-------------|----------|---------|----------|
| Development | `pnpm dev` on port 3000 | Spring Boot on port 8080 | PostgreSQL 17 in Docker on 5432 |
| Production | Static hosting for the Next.js build | App server running the packaged jar | Managed PostgreSQL with daily backups |

Deploys are repeatable because Flyway owns the schema and Hibernate only validates. Backend packaging today means building the jar locally with `./mvnw package`. Containerizing the backend plus the database for one command startup is planned before staging.

## 19.7 Testing Strategy

| Level | Tooling | Status |
|-------|---------|--------|
| Backend unit and slice tests | JUnit 5 with Spring Boot Test and Testcontainers | Live: `AuthProjectFlowTest`, `AllocationServiceTest`, `ProjectServiceTest` |
| Frontend unit tests | Vitest plus Testing Library | Live: 24 tests in `frontend/lib` and `frontend/components` |
| End to end | To be decided | Not started |
| CI today | Frontend lint, typecheck, test, and production build plus backend verify | Live in `.github/workflows/ci.yml` |

The honest position: CI guards compilation and style, and service level coverage exists for registration, login, project creation, allocation, and the submit state machine. End to end coverage across the real UI is still missing. Once a browser suite exists, target 80 percent on the service layer.
