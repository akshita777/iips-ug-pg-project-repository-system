# 7. Class Diagram

## 7.1 Domain Model

```mermaid
classDiagram
    class User {
        -Long id
        -String name
        -String email
        -String password
        -Role role
        +login()
        +logout()
    }
    
    class Student {
        -String rollNumber
        -int semester
        -String program
        +submitProject()
        +uploadVersion()
    }
    
    class Faculty {
        -String employeeId
        -String department
        -int maxCapacity
        +reviewSubmission()
        +approveReject()
    }
    
    class Project {
        -Long id
        -String title
        -String abstract
        -String techStack
        -ProjectStatus status
        +submit()
        +approve()
        +reject()
    }
    
    class SubmissionVersion {
        -Long id
        -int versionNumber
        -String filePath
        -LocalDateTime uploadedAt
        -String comments
    }
    
    class GuideAllocation {
        -Long id
        -LocalDateTime allocatedAt
        -AllocationStatus status
    }
    
    class Evaluation {
        -Long id
        -Map criteria
        -double totalMarks
        -String feedback
        -EvaluationStatus status
    }
    
    class Rubric {
        -Long id
        -String name
        -List criteria
    }
    
    User <|-- Student
    User <|-- Faculty
    Student "1" --> "*" Project : submits
    Project "1" --> "*" SubmissionVersion : has
    Faculty "1" --> "*" GuideAllocation : receives
    Student "1" --> "*" GuideAllocation : receives
    Project "1" --> "*" Evaluation : evaluated
    Evaluation "*" --> "1" Rubric : uses
```

## 7.2 Design Decisions

- **User hierarchy:** Single table inheritance with role discriminator
- **Version control:** Immutable versions with metadata
- **Audit trail:** createdAt, updatedAt on all entities
- **Soft delete:** deletedAt field for data retention
