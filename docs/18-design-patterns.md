# 18. Design Patterns

## 18.1 Patterns Used

| Pattern | Location | Purpose |
|---------|----------|---------|
| **Layered Architecture** | Entire backend | Separation of concerns |
| **Repository** | Spring Data JPA | Data access abstraction |
| **DTO** | Controller ↔ Service | API contract isolation |
| **Factory** | EvaluationService | Create different evaluator types |
| **Observer** | NotificationService | Decouple status change from notification |
| **Strategy** | AllocationService | Swappable allocation algorithms |
| **Singleton** | Spring beans | Default scope for services |
| **Builder** | Entity construction | Complex object creation |
| **Adapter** | S3StorageService | Abstract storage provider |

## 18.2 Pattern Details

### Repository Pattern
```java
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByStudentId(Long studentId);
    List<Project> findByStatus(ProjectStatus status);
}
```

### Strategy Pattern (Guide Allocation)
```java
public interface AllocationStrategy {
    List<GuideAllocation> allocate(List<Student> students, List<Faculty> faculty);
}

@Component
public class PreferenceBasedAllocation implements AllocationStrategy { ... }

@Component
public class CapacityBasedAllocation implements AllocationStrategy { ... }
```

### Observer Pattern (Notifications)
```java
@Component
public class ProjectStatusObserver {
    @EventListener
    public void onStatusChange(ProjectStatusEvent event) {
        notificationService.notify(event.getProjectId(), event.getNewStatus());
    }
}
```

### Factory Pattern (Evaluation)
```java
@Component
public class EvaluationFactory {
    public Evaluation createEvaluation(EvaluatorType type, Project project) {
        return switch (type) {
            case INTERNAL -> new InternalEvaluation(project);
            case EXTERNAL -> new ExternalEvaluation(project);
        };
    }
}
```

## 18.3 Why These Patterns?
- **Layered + Repository:** Clean architecture, testable, OOAD traceable
- **Strategy:** Allocation algorithm can be changed without modifying callers
- **Observer:** Status changes trigger notifications without coupling
- **Factory:** Different evaluation types with common interface
