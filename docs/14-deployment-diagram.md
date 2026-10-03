# 14. Deployment Diagram

## 14.1 Production Deployment

```mermaid
graph TB
    subgraph Client["Client Tier"]
        BROWSER[Web Browser]
    end
    
    subgraph CDN["CDN Tier"]
        VERCEL[Vercel CDN]
    end
    
    subgraph App["Application Tier"]
        NEXT[Next.js Frontend]
        SPRING[Spring Boot Backend]
    end
    
    subgraph Data["Data Tier"]
        PG[(PostgreSQL 17)]
        S3[S3 Storage]
    end
    
    subgraph External["External Services"]
        SMTP[SMTP Server]
    end
    
    BROWSER -->|HTTPS| VERCEL
    VERCEL -->|HTTPS| NEXT
    NEXT -->|REST/JSON| SPRING
    SPRING -->|JDBC| PG
    SPRING -->|S3 API| S3
    SPRING -->|SMTP| SMTP
```

## 14.2 Development Deployment

```mermaid
graph TB
    subgraph Local["Local Machine"]
        DEV[Developer Machine]
        DOCKER[Docker Desktop]
    end
    
    subgraph Containers["Docker Containers"]
        NEXT_DEV[Next.js Dev Server]
        SPRING_DEV[Spring Boot Dev]
        PG_DEV[PostgreSQL Container]
    end
    
    DEV -->|npm run dev| NEXT_DEV
    DEV -->|mvn spring-boot:run| SPRING_DEV
    DOCKER -->|docker run| PG_DEV
    NEXT_DEV -->|REST| SPRING_DEV
    SPRING_DEV -->|JDBC| PG_DEV
```

## 14.3 Deployment Environments

| Environment | Frontend | Backend | Database |
|-------------|----------|---------|----------|
| Development | localhost:3000 | localhost:8080 | localhost:5432 |
| Staging | staging.iips-pms.com | api-staging.iips-pms.com | staging-db |
| Production | iips-pms.com | api.iips-pms.com | prod-db |
