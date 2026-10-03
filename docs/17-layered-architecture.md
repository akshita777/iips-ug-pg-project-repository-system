# 17. Layered Architecture

## 17.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Web UI    │  │  Mobile UI  │  │   API Docs  │     │
│  │  (Next.js)  │  │  (Future)   │  │  (Swagger)  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│                    Application Layer                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Controllers│  │    DTOs     │  │   Mappers   │     │
│  │  (REST API) │  │             │  │  (MapStruct)│     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│                      Domain Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Services   │  │  Entities   │  │  Repositories│    │
│  │  (Business) │  │  (JPA)      │  │  (JPA)      │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Security  │  │   Storage   │  │   Database  │     │
│  │  (JWT/RBAC) │  │   (S3)      │  │ (PostgreSQL)│     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## 17.2 Layer Responsibilities

### Presentation Layer (Next.js)
- React Server Components for SSR
- Client components for interactivity
- API client for backend communication
- Form validation (Zod)

### Application Layer (Spring Boot Controllers)
- REST endpoints
- Request/Response DTOs
- Input validation (Bean Validation)
- Exception handling

### Domain Layer (Spring Boot Services + JPA)
- Business logic
- Entity definitions
- Repository interfaces
- Domain events

### Infrastructure Layer
- Spring Security (JWT, RBAC)
- S3 file storage
- PostgreSQL persistence
- Flyway migrations

## 17.3 Data Flow

```
Client → Next.js → Spring Boot Controller → Service → Repository → PostgreSQL
                                         ↓
                                    Security (JWT)
                                         ↓
                                    Storage (S3)
```

## 17.4 Design Principles
- **Separation of Concerns:** Each layer has single responsibility
- **Dependency Inversion:** Services depend on repository interfaces
- **DTO Pattern:** Separate API contracts from domain entities
- **Immutable Versions:** SubmissionVersion is append-only
