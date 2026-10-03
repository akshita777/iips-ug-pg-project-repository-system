# Software Requirements Specification
## IIPS UG-PG Academic Project Repository and Record Management System

**Version:** 1.0
**Date:** October 2026
**Institution:** International Institute of Professional Studies, DAVV Indore
**Course:** Object Oriented Analysis and Design Laboratory

---

## 1. Introduction

### 1.1 Purpose

This document specifies what the IIPS Project Portal must do and how well it must do it. It serves as the agreement between the development team, the faculty coordinators, and the OOAD lab evaluators. Every functional requirement here traces to a use case in `05-use-case-model.md`, and every design decision traces back to these pages.

### 1.2 Scope

The system manages the complete academic project lifecycle for the BCA program (semesters 1 to 6) and the MCA program (semesters 7 to 10). Formal project evaluation happens twice: at the end of BCA (semester 6) and at the end of MCA (semester 10). Between those milestones, the system keeps a continuous record of synopses, guide preferences, minor projects, and review feedback.

The system covers five areas:

1. Project submission by students
2. Central repository of all projects and their versions
3. Guide allocation with coordinator oversight
4. Version control through linked GitHub repositories and file uploads
5. Rubric based evaluation by internal and external examiners

The system does not cover plagiarism detection, online code execution, fee payment, or attendance. Those remain outside this project.

### 1.3 Definitions

| Term | Meaning |
|------|---------|
| Student | A BCA or MCA student enrolled at IIPS |
| Guide | A faculty member who mentors one or more student projects |
| Coordinator | The faculty member who runs allocation and oversees the workflow |
| Evaluator | An internal or external examiner who grades projects |
| Submission version | One immutable upload of project files, numbered in order |
| Allocation | The confirmed pairing of a student project with a guide |

### 1.4 References

- Use case model: `docs/05-use-case-model.md`
- Class diagram: `docs/07-class-diagram.md`
- Database design: `docs/15-database-design.md`
- IEEE 830-1998, Recommended Practice for Software Requirements Specifications

---

## 2. Overall Description

### 2.1 Product Perspective

The portal is a new, self contained web application. It replaces the current practice of collecting project reports over email and shared drives. It consists of a Next.js frontend, a Spring Boot backend API, and a PostgreSQL database. File storage uses the local disk in development and S3 compatible storage in production. Authentication uses JWT tokens with role based access.

### 2.2 User Classes

| User | What they do | Technical comfort |
|------|--------------|-------------------|
| Student | Creates projects, uploads versions, links GitHub repos, views results | High |
| Guide | Reviews submissions, approves or asks for changes, tracks students | Medium |
| Coordinator | Runs guide allocation, resolves conflicts, monitors progress | Medium |
| Evaluator | Grades assigned projects against a rubric, writes feedback | Low to medium |
| Admin | Manages accounts, roles, rubrics, and backups | High |

### 2.3 Operating Environment

- Browsers: current Chrome, Firefox, and Edge
- Frontend: served from Vercel or the college server, works on lab machines with 4 GB RAM
- Backend: Java 21 or newer, runs on a single app server for the whole department
- Database: PostgreSQL 17 with automated daily backups

### 2.4 Assumptions

- Every student and faculty member has a working email address and a GitHub account.
- The coordinator publishes allocation timelines each semester.
- Rubrics are defined by the department before evaluation begins.

---

## 3. Functional Requirements

### 3.1 Authentication and Accounts (FR-01 to FR-03)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | A visitor can register with name, email, password, and role. The system rejects duplicate emails and weak passwords. | Must |
| FR-02 | A registered user can log in and receive a short lived access token plus a refresh token. | Must |
| FR-03 | An admin can create, disable, and change roles of any account. | Must |

### 3.2 Project Submission (FR-04 to FR-07)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-04 | A student can create a project with title, abstract, and tech stack. New projects start in Draft. | Must |
| FR-05 | A student can submit a Draft or a returned project for review. Submission moves it to Submitted and notifies the guide. | Must |
| FR-06 | A student can upload a new file version at any time. Old versions stay untouched and stay listed in order. | Must |
| FR-07 | A student can link a GitHub repository to a project. The system shows commit history and branch names from that repo. | Must |

### 3.3 Guide Allocation (FR-08 to FR-10)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-08 | A student can submit a ranked list of preferred guides. | Must |
| FR-09 | The system prepares a draft allocation from preferences, guide capacity, and department. The coordinator confirms or edits it before it takes effect. | Must |
| FR-10 | Every allocation change notifies the affected student and guide by email and in app notice. | Should |

### 3.4 Review and Evaluation (FR-11 to FR-14)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-11 | A guide can approve a submission or return it with written comments. The student sees the decision and the comments. | Must |
| FR-12 | An evaluator can grade an approved project against the active rubric and write feedback. | Must |
| FR-13 | The system combines internal and external marks into a final score using the weights set by the coordinator. | Must |
| FR-14 | A student can view marks, feedback, and the final score for each of their evaluated projects. | Must |

### 3.5 Records and Reports (FR-15 to FR-17)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-15 | The system keeps every project, version, allocation, and evaluation for at least ten years. Completed semester 6 and semester 10 projects become read only archives. | Must |
| FR-16 | A coordinator can export project lists, allocation tables, and result sheets as CSV. | Should |
| FR-17 | A guide can see a workload summary: how many students are allocated, how many reviews are pending, and how many are done. | Should |

---

## 4. Non Functional Requirements

### 4.1 Performance

| ID | Requirement |
|----|-------------|
| NFR-01 | Nine out of ten page loads finish within two seconds on lab machines. |
| NFR-02 | API calls other than file upload respond within 500 ms at normal load. |
| NFR-03 | The system supports 500 concurrent users during submission week. |

### 4.2 Security

| ID | Requirement |
|----|-------------|
| NFR-04 | All traffic runs over HTTPS. Passwords are stored hashed with bcrypt. |
| NFR-05 | Access tokens expire after 15 minutes. Refresh tokens expire after 7 days and rotate on use. |
| NFR-06 | Every endpoint checks the caller role before serving data. Students see only their own projects. |
| NFR-07 | All inputs are validated on both client and server. Database access uses parameterized queries only. |

### 4.3 Reliability and Recovery

| ID | Requirement |
|----|-------------|
| NFR-08 | The service stays up 99.5 percent of the time in a semester, excluding planned maintenance. |
| NFR-09 | The database is backed up daily and a backup is restore tested every month. |
| NFR-10 | A failed upload never deletes or corrupts an earlier version. |

### 4.4 Usability and Accessibility

| ID | Requirement |
|----|-------------|
| NFR-11 | The interface works on screens from 360 px wide upward with no horizontal scrolling. |
| NFR-12 | Text contrast and keyboard navigation meet WCAG 2.1 AA. |
| NFR-13 | Error messages say what went wrong and what to do next, in plain words. |

---

## 5. Constraints

1. The database must be PostgreSQL. Schema changes go through Flyway migrations only.
2. The backend must be Spring Boot with layered packages (controller, service, repository, entity).
3. The frontend must be Next.js with TypeScript.
4. All UML diagrams in this project are drawn from DOT sources kept in `docs/diagrams/` so any evaluator can recompile them with Graphviz.

## 6. Acceptance Criteria

The project is accepted when:

1. A student can register, create a project, upload two versions, link a GitHub repo, and submit, all within one session.
2. A coordinator can run allocation for a batch, adjust one pairing, and both affected users get notified.
3. A guide can return a submission with comments, the student can resubmit, and the full history is visible.
4. An evaluator can grade a project with the rubric and the final score appears on the student dashboard.
5. Every DOT diagram in `docs/diagrams/` compiles with `dot -Tsvg` without warnings.
