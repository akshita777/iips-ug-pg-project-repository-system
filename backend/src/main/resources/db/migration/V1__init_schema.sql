CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    abstract TEXT,
    tech_stack VARCHAR(500),
    status VARCHAR(20) DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE submission_versions (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT REFERENCES projects(id),
    version_number INTEGER NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    comments TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE guide_allocations (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT REFERENCES users(id),
    faculty_id BIGINT REFERENCES users(id),
    project_id BIGINT REFERENCES projects(id),
    status VARCHAR(20) DEFAULT 'PENDING',
    allocated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE evaluations (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT REFERENCES projects(id),
    evaluator_id BIGINT REFERENCES users(id),
    rubric_id BIGINT,
    total_marks DECIMAL(5,2),
    feedback TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    evaluated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rubrics (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    criteria JSONB NOT NULL
);

CREATE INDEX idx_projects_student ON projects(student_id);
CREATE INDEX idx_versions_project ON submission_versions(project_id);
CREATE INDEX idx_allocations_faculty ON guide_allocations(faculty_id);
CREATE INDEX idx_evaluations_project ON evaluations(project_id);
CREATE INDEX idx_users_email ON users(email);
