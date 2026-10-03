# 13. Component Diagram

## 13.1 System Components

```mermaid
graph TB
    subgraph Presentation["Presentation Layer"]
        WEB[Web Browser]
        MOB[Mobile Browser]
    end
    
    subgraph Frontend["Frontend Server"]
        NEXT[Next.js 15]
        AUTH_FE[NextAuth]
        API_CLIENT[API Client]
    end
    
    subgraph Backend["Backend Server"]
        SPRING[Spring Boot 3.5]
        CTRL[Controllers]
        SVC[Services]
        SEC[Spring Security]
        JWT[JWT Filter]
    end
    
    subgraph Data["Data Layer"]
        JPA[Spring Data JPA]
        FLYWAY[Flyway]
        PG[(PostgreSQL 17)]
    end
    
    subgraph External["External Services"]
        S3[S3 Storage]
        EMAIL[Email Service]
    end
    
    WEB -->|HTTPS| NEXT
    MOB -->|HTTPS| NEXT
    NEXT --> AUTH_FE
    NEXT --> API_CLIENT
    API_CLIENT -->|REST/JSON| SPRING
    SPRING --> CTRL
    CTRL --> SVC
    SVC --> SEC
    SEC --> JWT
    SVC --> JPA
    JPA --> PG
    FLYWAY --> PG
    SVC --> S3
    SVC --> EMAIL
```

## 13.2 Component Interfaces

| Component | Interface | Protocol |
|-----------|-----------|----------|
| Web Browser | HTTP/HTTPS | REST |
| Next.js | Internal | React Server Components |
| API Client | HTTP/JSON | REST |
| Spring Boot | Internal | Spring DI |
| JPA | JDBC | SQL |
| Flyway | JDBC | SQL |
| S3 | HTTP | S3 API |
| Email | SMTP | SMTP |
