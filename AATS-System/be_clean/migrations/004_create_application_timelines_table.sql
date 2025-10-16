-- Migration: Create application_timelines table
CREATE TABLE IF NOT EXISTS application_timelines (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36),
    status VARCHAR(50),
    date TIMESTAMP,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);