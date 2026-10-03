-- Structured student identity plus batch mentor assignments.
ALTER TABLE users ADD COLUMN IF NOT EXISTS program_code VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS batch_year INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS section VARCHAR(1);

CREATE TABLE batch_mentors (
    id BIGSERIAL PRIMARY KEY,
    faculty_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
    program_code VARCHAR(10) NOT NULL,
    batch_year INTEGER NOT NULL,
    UNIQUE (program_code, batch_year)
);
