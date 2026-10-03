# 19. Software Design Document (SDD)

## 19.1 Introduction
This SDD describes the technical design of the IIPS UG-PG Academic Project Repository & Record Management System.

## 19.2 System Architecture
- **Frontend:** Next.js 15 (App Router, TypeScript, Tailwind, shadcn/ui)
- **Backend:** Spring Boot 3.5 (REST, JPA, Security)
- **Database:** PostgreSQL 17 (Flyway migrations)
- **Auth:** NextAuth (FE) + Spring Security JWT (BE)
- **Storage:** S3-compatible / local filesystem

## 19.3 Module Design

### 19.3.1 Authentication Module
- JWT-based stateless authentication
- Role-based access control (RBAC)
- Refresh token rotation
- Password hashing with bcrypt

### 19.3.2 Project Management Module
- CRUD operations for projects
- Version control with immutable submissions
- Status workflow (DRAFT → SUBMITTED → APPROVED → EVALUATED)

### 19.3.3 Guide Allocation Module
- Preference-based allocation
- Capacity constraints
- Coordinator override capability

### 19.3.4 Evaluation Module
- Rubric-based evaluation
- Internal + External evaluator support
- Automated score calculation

### 19.3.5 Notification Module
- Email notifications
- In-app notifications
- Status change alerts

## 19.4 API Design

### Base URL: `/api/v1`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | User login | Public |
| POST | `/auth/register` | User registration | Public |
| GET | `/projects` | List projects | Student+ |
| POST | `/projects` | Create project | Student |
| GET | `/projects/{id}` | Get project | Student+ |
| POST | `/projects/{id}/submit` | Submit project | Student |
| POST | `/projects/{id}/versions` | Upload version | Student |
| GET | `/allocations` | List allocations | Coordinator+ |
| POST | `/allocations/confirm` | Confirm allocation | Coordinator |
| GET | `/evaluations` | List evaluations | Evaluator+ |
| POST | `/evaluations` | Create evaluation | Evaluator |
| GET | `/users` | List users | Admin |
| POST | `/users` | Create user | Admin |

## 19.5 Security Design
- HTTPS only
- JWT with 15min access + 7d refresh tokens
- RBAC with 5 roles
- Input validation (Bean Validation)
- SQL injection prevention (JPA)
- XSS prevention (React escaping)
- CSRF protection (SameSite cookies)

## 19.6 Deployment Strategy
- **Frontend:** Vercel (auto-deploy on push)
- **Backend:** Docker container on college server / AWS EC2
- **Database:** PostgreSQL 17 (managed or self-hosted)
- **CI/CD:** GitHub Actions (lint, test, build, deploy)

## 19.7 Testing Strategy
- **Unit Tests:** JUnit 5 (backend), Vitest (frontend)
- **Integration Tests:** Spring Boot Test, Testcontainers
- **E2E Tests:** Playwright
- **Coverage Target:** 80%+
