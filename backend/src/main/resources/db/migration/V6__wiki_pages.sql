CREATE TABLE wiki_pages (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (project_id, title)
);

CREATE INDEX idx_wiki_project ON wiki_pages(project_id);
