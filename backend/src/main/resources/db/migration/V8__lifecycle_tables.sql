-- Project types plus synopsis, deadline, and review slot tables.
ALTER TABLE projects ADD COLUMN IF NOT EXISTS type VARCHAR(10) NOT NULL DEFAULT 'MINOR';

CREATE TABLE synopses (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_synopses_student ON synopses(student_id);

CREATE TABLE deadline_windows (
    id BIGSERIAL PRIMARY KEY,
    batch_mentor_id BIGINT NOT NULL REFERENCES batch_mentors(id),
    project_type VARCHAR(10) NOT NULL,
    opens_on TIMESTAMP NOT NULL,
    closes_on TIMESTAMP NOT NULL
);

CREATE TABLE review_slots (
    id BIGSERIAL PRIMARY KEY,
    faculty_id BIGINT NOT NULL REFERENCES users(id),
    student_id BIGINT REFERENCES users(id),
    starts_at TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN'
);

CREATE INDEX idx_slots_faculty ON review_slots(faculty_id);
