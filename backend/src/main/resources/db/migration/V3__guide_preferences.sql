CREATE TABLE guide_preferences (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id),
    faculty_id BIGINT NOT NULL REFERENCES users(id),
    rank INTEGER NOT NULL,
    UNIQUE (student_id, faculty_id)
);

CREATE INDEX idx_preferences_student ON guide_preferences(student_id);
