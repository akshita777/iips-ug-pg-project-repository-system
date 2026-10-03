# 5. Use Case Model

## 5.1 Use Case Diagram

![Use case diagram](diagrams/05-use-case.svg)

Source: [05-use-case.dot](diagrams/05-use-case.dot). Recompile with `dot -Tsvg 05-use-case.dot -o 05-use-case.svg`.

## 5.2 Use Case Descriptions

### UC-01: Register/Login
- **Actor:** Student, Guide, Coordinator, Evaluator, Admin
- **Precondition:** User has valid credentials
- **Flow:** User enters credentials, system validates, system creates session, user lands on dashboard
- **Postcondition:** User authenticated

### UC-02: Create Project
- **Actor:** Student
- **Precondition:** Student logged in
- **Flow:** Student enters project details, system validates, system creates project, student can upload files
- **Postcondition:** Project created in Draft state

### UC-03: Submit Project
- **Actor:** Student
- **Precondition:** Project exists with files
- **Flow:** Student clicks submit, system changes status to Submitted, guide notified
- **Postcondition:** Project in Submitted state

### UC-04: Upload Version
- **Actor:** Student
- **Precondition:** Project exists
- **Flow:** Student uploads new version, system creates immutable version, version history updated
- **Postcondition:** New version available

### UC-05: Review Submission
- **Actor:** Guide
- **Precondition:** Project submitted to guide
- **Flow:** Guide views submission, guide approves or rejects, student notified
- **Postcondition:** Project status updated

### UC-06: Allocate Guides
- **Actor:** Coordinator
- **Precondition:** Students have submitted preferences
- **Flow:** System suggests allocation, coordinator reviews, coordinator confirms or overrides
- **Postcondition:** Guides allocated

### UC-07: Evaluate Project
- **Actor:** Evaluator
- **Precondition:** Project approved by guide
- **Flow:** Evaluator views project, evaluator assigns marks per rubric, system calculates final score
- **Postcondition:** Evaluation complete

### UC-08: Track Project Workflow
- **Actor:** Coordinator
- **Precondition:** Coordinator logged in
- **Flow:** Coordinator opens workflow view, system shows counts by status, coordinator follows up on stuck projects
- **Postcondition:** Coordinator has full status picture

### UC-09: Assign Roles
- **Actor:** Admin
- **Precondition:** Admin logged in
- **Flow:** Admin opens user list, admin changes a user role, system applies new permissions on next login
- **Postcondition:** User role updated
