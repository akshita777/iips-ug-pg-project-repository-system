CREATE TABLE linked_repositories (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL UNIQUE REFERENCES projects(id),
    repo_url VARCHAR(500) NOT NULL,
    repo_owner VARCHAR(255) NOT NULL,
    repo_name VARCHAR(255) NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_synced_at TIMESTAMP
);

CREATE TABLE commit_records (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id),
    sha VARCHAR(64) NOT NULL UNIQUE,
    message TEXT,
    author VARCHAR(255),
    committed_at TIMESTAMP
);

CREATE INDEX idx_commits_project ON commit_records(project_id);

CREATE TABLE code_reviews (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id),
    reviewer_id BIGINT NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    comments TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_project ON code_reviews(project_id);

CREATE TABLE team_members (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id),
    student_id BIGINT NOT NULL REFERENCES users(id),
    team_role VARCHAR(20) NOT NULL DEFAULT 'DEVELOPER',
    UNIQUE (project_id, student_id)
);
