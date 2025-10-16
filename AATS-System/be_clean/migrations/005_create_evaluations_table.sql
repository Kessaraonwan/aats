-- Migration: Create evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36) UNIQUE,
    evaluator_id VARCHAR(36),
    evaluator_name VARCHAR(255),
    technical_skills INTEGER,
    communication INTEGER,
    problem_solving INTEGER,
    cultural_fit INTEGER,
    overall_score FLOAT,
    strengths TEXT,
    weaknesses TEXT,
    comments TEXT,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);