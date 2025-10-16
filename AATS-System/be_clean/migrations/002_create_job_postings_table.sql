-- Migration: Create job_postings table
CREATE TABLE IF NOT EXISTS job_postings (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    location VARCHAR(255),
    experience_level VARCHAR(255),
    description TEXT,
    requirements TEXT,
    responsibilities TEXT,
    status VARCHAR(50),
    posted_date TIMESTAMP,
    closing_date TIMESTAMP,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);