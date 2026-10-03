# 17. Layered Architecture

This document explains how the code is organized, what each layer is allowed to do, and which way dependencies point. Everything named here exists in the repo today unless it is tagged Planned.

---

## 17.1 The Layers

```
Browser
  |
  v
Next.js frontend          frontend/app, frontend/components, frontend/lib
  |  REST JSON over HTTPS
  v
Controller layer          backend/.../controller/AuthController, ProjectController
  |
  v
Service layer             backend/.../service/AuthService, ProjectService
  |\
  | \--> Security        backend/.../security/JwtUtil, JwtAuthFilter,
  |                       CustomUserDetailsService, SecurityConfig
  |
  v
Repository layer          backend/.../repository/*Repository
  |
  v
Entity layer              backend/.../entity/User, Student, Faculty,
                          Project, SubmissionVersion, GuideAllocation,
                          Evaluation, Rubric
  |
  v
PostgreSQL 17             schema owned by Flyway, backend/.../resources/db/migration
```

Cross cutting pieces that serve layers rather than sitting in them: DTOs with Bean Validation (`backend/.../dto`), the global exception handler (`backend/.../exception`), and the axios API client with token refresh (`frontend/lib/api.ts`).

## 17.2 What Each Layer Owns

### Presentation: Next.js frontend

Owns pages, the neobrutalist component kit, form validation with Zod, and the API client. It holds no business rules. Route protection is a thin token check that redirects to login. The backend remains the authority on who may do what.

### Controller layer: HTTP boundary

Owns routes, request shapes, and response codes. Controllers authenticate the caller from the JWT, delegate everything to a service, and translate domain errors into HTTP statuses through the global handler. Controllers never touch repositories or SQL. Live today: `AuthController` (register, login, refresh) and `ProjectController` (list, read, create, submit).

### Service layer: business rules

Owns the rules that make the product correct. `AuthService` handles registration with duplicate email checks and bcrypt hashing, login through the authentication manager, and token issue. `ProjectService` enforces that only students create projects and only Draft or returned projects can be submitted. Services are transactional at the method level. Planned services (allocation, evaluation, versioning, notification) will live here under the same rules.

### Security: authentication and authorization

Owns identity. `JwtUtil` signs and verifies tokens. `JwtAuthFilter` runs once per request, extracts the bearer token, and fills the security context. `CustomUserDetailsService` loads the account and maps the stored role to a granted authority. `SecurityConfig` declares the filter chain: public auth endpoints, role gated admin, allocation, and evaluation paths, stateless sessions, and CORS limited to the frontend origin. Method security is enabled so service methods can carry their own role checks later.

### Repository layer: data access

Owns query definitions only. Each interface extends `JpaRepository` and declares finder methods such as projects by student or versions ordered by version number. No SQL strings live here. Custom queries, when needed, will use derived method names or JPQL, never concatenated SQL.

### Entity layer: domain state

Owns the JPA mappings that mirror the class diagram in `docs/07-class-diagram.md` and the tables in `docs/15-database-design.md`. Users use single table inheritance with a role discriminator. Submission versions are append only by convention: no service updates or deletes them. Timestamps are set by entity lifecycle callbacks.

### Database: PostgreSQL with Flyway

Owns the schema. `ddl-auto` is set to validate, which means Hibernate never alters tables. Every schema change arrives as a versioned Flyway migration. Seed data will arrive the same way, starting with the default rubric set.

## 17.3 Dependency Rules

1. Dependencies point downward only. Controllers call services. Services call repositories and security. Nothing calls upward.
2. Layers talk through their immediate neighbor. The frontend never reaches the database. Controllers never reach repositories.
3. Entities never leak over HTTP. Controllers accept and return DTOs, and validation annotations live on the DTOs.
4. The database schema is append only in practice. Migrations add tables and columns. Destructive changes need a coordinator approved migration with a backup first.

## 17.4 Request Walkthrough

Login: browser posts credentials to `AuthController`, which calls `AuthService`. The service authenticates through the authentication manager, loads the account through `UserRepository`, and returns signed access and refresh tokens from `JwtUtil`.

Project submission: browser posts with a bearer token to `ProjectController`. `JwtAuthFilter` authenticates the request first. The controller delegates to `ProjectService`, which checks the caller is a student and the project is in a submittable state, then saves through `ProjectRepository`. The security context and the service rule together enforce both identity and permission.

## 17.5 Production Notes

- Stateless API with no server session makes horizontal scaling straightforward. Any instance serves any request given the database.
- Flyway validate plus versioned migrations means deploys are repeatable across development, staging, and production.
- The current gap to close before production traffic: no rate limiting on auth endpoints, no refresh token reuse detection, and file uploads have no virus scanning. These are recorded as hardening tasks, not as existing behavior.
