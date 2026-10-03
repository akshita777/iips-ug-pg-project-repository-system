# 19. Software Design Document (SDD)

## 19.1 Introduction

This document is the technical reference for building and running the IIPS Project Portal. It states the architecture, the module boundaries, the exact API surface, and the security, deployment, and testing positions. Anything tagged Planned is designed but not yet built. Related reading: the requirements in `docs/03-srs.md`, the layer rules in `docs/17-layered-architecture.md`, and the database in `docs/15-database-design.md`.

**Version:** 1.0
**Date:** October 2026

## 19.2 System Architecture

| Piece | Choice | Status |
|-------|--------|--------|
| Frontend | Next.js 15 App Router with TypeScript and Tailwind | Live |
| UI kit | Custom neobrutalist components in `frontend/components/ui` | Live |
| Backend | Spring Boot 3.5 with plain Java, no Lombok | Live |
| Data access | Spring Data JPA repositories | Live |
| Database | PostgreSQL 17, schema owned by Flyway | Live |
| Auth | Spring Security with JWT bearer tokens and role checks | Live |
| Frontend sessions | Token storage with refresh retry in the API client | Live |
| GitHub OAuth | NextAuth with GitHub provider | Planned, issue 35 |
| File storage | Local disk in development, S3 compatible store in production | Planned |
| API docs | Springdoc OpenAPI served from the backend | Planned |

## 19.3 Module Design

### 19.3.1 Authentication Module (Live)

Files: `security/JwtUtil`, `security/JwtAuthFilter`, `security/CustomUserDetailsService`, `security/SecurityConfig`, `service/AuthService`, `controller/AuthController`.

Registration rejects duplicate emails, hashes passwords with bcrypt, creates the correct account subtype for the requested role, and returns an access token plus a refresh token. Login authenticates through the authentication manager and returns fresh tokens. Refresh verifies the refresh token and issues a new access token. Public paths are limited to `/api/v1/auth/**` and `/error`. Admin, allocation, and evaluation paths require their roles. Everything else requires authentication.

### 19.3.2 Project Module (Live)

Files: `service/ProjectService`, `controller/ProjectController`, `entity/Project`, `entity/SubmissionVersion`, `repository/ProjectRepository`, `repository/SubmissionVersionRepository`.

Students create projects that start in Draft. Submitting moves a Draft or returned project to Submitted. The service rejects creation by non students and submission from any other state. Version records are append only. Version upload endpoints and the GitHub linking service are planned and will extend this module without changing its rules.

### 19.3.3 Guide Allocation Module (Planned)

Preference intake, draft allocation from preferences and capacity, coordinator confirm or adjust, and notifications to both sides. Entities and tables already exist (`GuideAllocation`, `guide_allocations`). The service with the Strategy design from `docs/18-design-patterns.md` is the remaining work.

### 19.3.4 Evaluation Module (Planned)

Rubric based grading with internal and external examiner support, weighted final scores, and student visible feedback. Entities and tables already exist (`Evaluation`, `Rubric`, `evaluations`, `rubrics`). The service and controller are the remaining work.

### 19.3.5 Notification Module (Planned)

Status change events with email and in app delivery. The Observer design from `docs/18-design-patterns.md` keeps this out of the project and allocation services.

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

### Planned Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/projects/{id}/versions` | Upload a new file version | Student |
| GET | `/projects/{id}/versions` | List version history | Authenticated |
| GET | `/allocations` | List allocations | Coordinator, Admin |
| POST | `/allocations/suggest` | Draft allocation from preferences | Coordinator |
| POST | `/allocations/confirm` | Confirm or adjusted allocation | Coordinator |
| GET | `/evaluations/assigned` | Projects assigned to the caller | Evaluator |
| POST | `/evaluations` | Submit marks and feedback | Evaluator |
| GET | `/users` | List accounts | Admin |
| PATCH | `/users/{id}/role` | Change a user role | Admin |

Error responses share one shape, `{ "error": "plain words" }`, produced by `GlobalExceptionHandler`. Validation failures return 400, broken business rules return 409, and unknown ids return 400 with a named message today. Standard 404 handling for missing resources is a planned refinement.

## 19.5 Security Design

- HTTPS terminates all traffic in every environment beyond local development.
- Passwords are hashed with bcrypt. Raw passwords never reach the database or logs.
- Access tokens live 15 minutes, refresh tokens live 7 days and rotate on use.
- Five roles gate endpoints in `SecurityConfig`: Student, Faculty, Coordinator, Evaluator, Admin. Method security is enabled for finer checks as services grow.
- Input validation runs on DTOs with Bean Validation and on forms with Zod. JPA uses parameterized queries throughout, and React escapes rendered content by default.
- CORS allows only the frontend origin with credentials enabled.
- Known gaps before production traffic: no rate limiting on auth endpoints, no refresh token reuse detection, no upload scanning. These are tracked hardening tasks.

## 19.6 Deployment Strategy

| Environment | Frontend | Backend | Database |
|-------------|----------|---------|----------|
| Development | `pnpm dev` on port 3000 | Spring Boot on port 8080 | PostgreSQL 17 in Docker on 5432 |
| Production | Static hosting for the Next.js build | App server running the packaged jar | Managed PostgreSQL with daily backups |

Deploys are repeatable because Flyway owns the schema and Hibernate only validates. There is no Dockerfile or compose file yet, so backend packaging today means building the jar locally. Containerizing the backend plus the database for one command startup is planned before staging.

## 19.7 Testing Strategy

| Level | Tooling | Status |
|-------|---------|--------|
| Backend unit and slice tests | JUnit 5 with Spring Boot Test and Testcontainers | Dependencies present, no tests written yet |
| Frontend unit tests | To be decided | Not started |
| End to end | To be decided | Not started |
| CI today | Frontend lint, typecheck, and production build plus backend verify | Live in `.github/workflows/ci.yml` |

The honest position: CI guards compilation and style, but behavior has no automated coverage yet. The first tests to write are service level tests for registration, login, project creation, and the submit state machine, using Testcontainers PostgreSQL so Flyway migrations run exactly as in production. Coverage target once the suite exists: 80 percent on the service layer.
