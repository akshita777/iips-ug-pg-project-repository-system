-- Synopsis feature removed from the codebase (see Synopsis entity/controller/service deletion).
-- V8 created this table, so drop it in a new migration instead of editing V8.
DROP INDEX IF EXISTS idx_synopses_student;
DROP TABLE IF EXISTS synopses;
