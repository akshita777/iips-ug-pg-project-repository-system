# 18. Design Patterns

This document records the patterns used in the codebase today and the ones planned for upcoming issues. A pattern appears under Used only if you can open the file and see it. Everything else sits under Planned with the issue that will introduce it.

---

## 18.1 Used Today

### Layered Architecture

The backend separates HTTP handling, business rules, data access, and domain state into the controller, service, repository, and entity packages. The full map is in `docs/17-layered-architecture.md`. The payoff is that a change to grading rules touches one service, and a change to an endpoint touches one controller.

### Repository

Each aggregate root gets an interface that extends `JpaRepository` and declares finders in plain method names. Callers never see SQL. Live examples in `backend/src/main/java/com/iips/pms/repository/`:

```java
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByStudentId(Long studentId);
    List<Project> findByStatus(Project.ProjectStatus status);
}

public interface SubmissionVersionRepository extends JpaRepository<SubmissionVersion, Long> {
    List<SubmissionVersion> findByProjectIdOrderByVersionNumberDesc(Long projectId);
}
```

### Data Transfer Object

Controllers accept and return records from `backend/src/main/java/com/iips/pms/dto/`, never entities. Validation annotations ride on the DTOs, so bad input is rejected at the boundary with a clear message:

```java
public record RegisterRequest(
        @NotBlank String name,
        @Email @NotBlank String email,
        @NotBlank String password,
        @NotBlank String role
) {}
```

### Dependency Injection with Constructor Wiring

Services, controllers, and security components declare their collaborators as final fields set through constructors. Spring wires them at startup, which keeps classes testable without the container and makes the dependency graph visible in plain Java. No field injection and no service locator calls appear anywhere.

### Intercepting Filter for Authentication

`JwtAuthFilter` extends `OncePerRequestFilter` and sits ahead of the username password filter in the chain declared by `SecurityConfig`. Every request passes through it exactly once. It extracts the bearer token, verifies it through `JwtUtil`, and fills the security context or lets the request continue unauthenticated. Authentication stays in one place instead of being repeated across controllers. `LoginRateLimitFilter` follows the same shape to throttle brute force attempts on `/api/v1/auth/*`.

### Strategy for Guide Allocation

`AllocationService` depends on the `AllocationStrategy` interface in `backend/src/main/java/com/iips/pms/service/allocation/`. Live implementations: `CapacityBalancingStrategy` for capacity aware assignment. The coordinator endpoint `POST /api/v1/allocations/suggest` invokes the strategy, and overrides stay manual through `/override` so a human always confirms the final assignment.

### Observer for Status Notifications

`ProjectService` publishes `ProjectStatusEvent` through Spring's `ApplicationEventPublisher` on every status change. `NotificationService.onProjectStatus` listens and saves a notification row for the recipient. `ProjectService` no longer knows about notification wiring, and adding a new listener like email stays a one file change.

### Adapter for GitHub API

`RepositoryService` wraps `RestTemplate` calls to the GitHub REST API behind plain methods like `syncCommits` and `listBranches`. Controllers only see domain records (`CommitRecord`, `LinkedRepository`). A second VCS provider can implement the same surface without changing controller code.

### Singleton Beans by Default

All services, repositories, and security components are Spring singletons. This is the framework default rather than a hand written pattern, and it fits because these collaborators hold no per request state. Request scoped data travels in method arguments and the security context instead.

---

## 18.2 Planned

### Factory for Evaluation Setup

Evaluation creation will move behind a small factory that builds the correct evaluation shape for internal versus external examiners from a shared rubric. This keeps the branching in one place when a third evaluator type arrives.

### Facade over the notification sinks

Today notifications are stored in the database only. When email and push arrive, a facade can fan one domain event out to all sinks without each listener knowing the others.

---

## 18.3 Why This Set

Layered plus Repository plus DTO gives clean architecture that is testable and traces directly to the OOAD diagrams. Constructor injection keeps the object graph honest. The filter centralizes a cross cutting concern that would otherwise spread across every controller. Strategy, Observer, and Factory are reserved for the exact spots where variation and decoupling are already known, which follows the rule of introducing a pattern at the third use rather than the first.
