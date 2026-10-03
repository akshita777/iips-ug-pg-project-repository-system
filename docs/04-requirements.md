# 4. Functional & Non-Functional Requirements

## 4.1 Functional Requirements (Detailed)

### FR-01: User Authentication
- JWT-based authentication
- Role-based access control (Student, Guide, Coordinator, Evaluator, Admin)
- Password hashing with bcrypt

### FR-02: Project Submission
- Student creates project with title, abstract, tech stack
- Submit for guide review
- Track submission status

### FR-03: Version Control
- Each upload creates immutable version
- Version history with timestamps
- Rollback capability

### FR-04: Guide Allocation
- Student submits guide preferences (ranked)
- System auto-allocates based on capacity + specialization
- Coordinator can override

### FR-05: Evaluation
- Rubric-based evaluation (multiple criteria)
- Internal + External evaluator marks
- Final score calculation

### FR-06: Reporting
- Student progress report
- Guide workload report
- Evaluation summary

## 4.2 Non-Functional Requirements

### Performance
- Page load < 2s
- API response < 500ms
- Support 500 concurrent users

### Security
- HTTPS only
- JWT with refresh tokens
- Input validation & sanitization
- SQL injection prevention (JPA parameterized queries)
- XSS prevention

### Usability
- Responsive design (mobile + desktop)
- WCAG 2.1 AA accessibility
- Intuitive navigation

### Reliability
- Automated backups
- Error logging & monitoring
- Graceful degradation

### Maintainability
- Clean architecture (layered)
- Comprehensive documentation
- Automated testing
