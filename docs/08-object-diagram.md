# 8. Object Diagram

## 8.1 Sem-6 BCA Final Project Submission (Snapshot)

```mermaid
objectDiagram
    student1 : Student
    student1.rollNumber = "BCA-2021-001"
    student1.semester = 6
    student1.program = "BCA"
    
    project1 : Project
    project1.title = "Online Library Management"
    project1.techStack = "Java, Spring Boot, React"
    project1.status = SUBMITTED
    
    version1 : SubmissionVersion
    version1.versionNumber = 1
    version1.uploadedAt = "2026-03-15T10:30:00"
    
    version2 : SubmissionVersion
    version2.versionNumber = 2
    version2.uploadedAt = "2026-04-01T14:20:00"
    
    guide1 : Faculty
    guide1.name = "Dr. A. Sharma"
    guide1.department = "Computer Science"
    
    allocation1 : GuideAllocation
    allocation1.status = CONFIRMED
    
    student1 --> project1 : submits
    project1 --> version1 : has
    project1 --> version2 : has
    guide1 --> allocation1 : receives
    student1 --> allocation1 : receives
```

## 8.2 Sem-10 MCA Final Project Submission (Snapshot)

```mermaid
objectDiagram
    student2 : Student
    student2.rollNumber = "MCA-2024-042"
    student2.semester = 10
    student2.program = "MCA"
    
    project2 : Project
    project2.title = "AI-Powered Student Performance Predictor"
    project2.techStack = "Python, TensorFlow, Next.js"
    project2.status = UNDER_REVIEW
    
    eval1 : Evaluation
    eval1.totalMarks = 85.5
    eval1.status = COMPLETED
    
    student2 --> project2 : submits
    project2 --> eval1 : evaluated
```
