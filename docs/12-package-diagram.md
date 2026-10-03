# 12. Package Diagram

## 12.1 System Packages

```mermaid
graph TB
    subgraph Frontend["Frontend (Next.js)"]
        UI[ui-presentation]
        AUTH[auth]
        API[api-client]
    end
    
    subgraph Backend["Backend (Spring Boot)"]
        CTRL[controller]
        SVC[service]
        REPO[repository]
        ENT[entity]
        SEC[security]
        DTO[dto]
    end
    
    subgraph Database["Database (PostgreSQL)"]
        DB[(postgres)]
    end
    
    subgraph External["External Services"]
        STORE[storage]
        NOTIF[notification]
    end
    
    UI --> AUTH
    UI --> API
    API -->|HTTP/REST| CTRL
    CTRL --> SVC
    SVC --> REPO
    SVC --> SEC
    SVC --> DTO
    REPO --> ENT
    ENT --> DB
    SVC --> STORE
    SVC --> NOTIF
```

## 12.2 Backend Package Structure

```
com.iips.pms
├── controller/     # REST endpoints
├── service/        # Business logic
├── repository/     # Data access
├── entity/         # JPA entities
├── dto/            # Data transfer objects
├── security/       # JWT, RBAC
├── config/         # Spring config
├── exception/      # Custom exceptions
└── util/           # Utilities
```

## 12.3 Frontend Package Structure

```
frontend/
├── app/            # Next.js App Router
│   ├── (auth)/     # Login, register
│   ├── (dashboard)/ # Role-based dashboards
│   └── api/        # API routes (proxy)
├── components/     # React components
│   ├── ui/         # shadcn/ui
│   └── features/   # Feature components
├── lib/            # Utilities, API client
└── types/          # TypeScript types
```
