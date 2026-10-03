-- Subclass columns for single-table user inheritance.
-- V1 only created the base columns, so Hibernate validate would fail on these.
ALTER TABLE users ADD COLUMN IF NOT EXISTS roll_number VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS semester INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS program VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS max_capacity INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_external BOOLEAN DEFAULT FALSE;

-- Default evaluation rubrics. Weights add up to 100.
INSERT INTO rubrics (name, criteria) VALUES
('BCA Final Project', '{"report": 30, "implementation": 30, "viva": 25, "regularity": 15}'),
('MCA Final Project', '{"report": 25, "implementation": 35, "viva": 25, "novelty": 15}'),
('Minor Project', '{"report": 30, "implementation": 40, "viva": 30}');
