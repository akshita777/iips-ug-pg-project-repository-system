# 13. Component Diagram

## 13.1 System Components

![Component diagram](diagrams/13-component.svg)

Source: [13-component.dot](diagrams/13-component.dot). Recompile with `dot -Tsvg 13-component.dot -o 13-component.svg`.

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
