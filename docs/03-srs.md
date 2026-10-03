# 3. Software Requirements Specification (SRS)

## 3.1 Introduction
This SRS describes the functional and non-functional requirements for the IIPS UG-PG Academic Project Repository & Record Management System.

## 3.2 System Overview
A web-based multi-role system managing project submissions, guide allocation, version control, and evaluation for BCA (Sem 1-6) and MCA (Sem 7-10) programs.

## 3.3 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Student can register and login | Must |
| FR-02 | Student can create project and submit for review | Must |
| FR-03 | Student can upload multiple versions of project files | Must |
| FR-04 | Guide can review and approve/reject submissions | Must |
| FR-05 | Coordinator can allocate guides to students | Must |
| FR-06 | System can auto-allocate guides based on preferences and capacity | Should |
| FR-07 | Evaluator can evaluate projects using rubric | Must |
| FR-08 | System can generate evaluation reports | Should |
| FR-09 | Admin can manage users and roles | Must |
| FR-10 | System can track student progress across semesters | Must |
| FR-11 | System can send notifications on status changes | Should |
| FR-12 | System can export data for reporting | Could |

## 3.4 Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Response time | < 2s for 95% requests |
| NFR-02 | Availability | 99.5% uptime |
| NFR-03 | Security | JWT + RBAC, HTTPS |
| NFR-04 | Scalability | 500 concurrent users |
| NFR-05 | Usability | WCAG 2.1 AA compliance |
| NFR-06 | Data retention | 10 years |

## 3.5 Constraints
- Must work on college lab machines (low-end hardware)
- Must support Chrome, Firefox, Edge
- Database must be PostgreSQL
