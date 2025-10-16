-- Migration: Create applications table
CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(36) PRIMARY KEY,
    job_id VARCHAR(36),
    applicant_id VARCHAR(36),
    resume TEXT,
    cover_letter TEXT,
    education TEXT,
    experience TEXT,
    skills TEXT,
    status VARCHAR(50),
    submitted_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);