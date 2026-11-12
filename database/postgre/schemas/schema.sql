-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    -- Everyone who signs up is a teacher ('faculty'). Promote admins manually:
    --   UPDATE users SET role = 'admin' WHERE email = 'someone@juit.ac.in';
    role VARCHAR(50) NOT NULL DEFAULT 'faculty' CHECK (role IN ('student', 'faculty', 'lab_manager', 'admin')),
    university_id VARCHAR(50),
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));

-- Login sessions (only a SHA-256 of each session token is stored)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash CHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Faculty Self Assessment Submissions table
CREATE TABLE faculty_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    academic_year VARCHAR(20) NOT NULL DEFAULT '2023-2024',
    faculty_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved')),
    total_api_score NUMERIC(8, 2) DEFAULT 0.00,
    api_breakdown JSONB DEFAULT '{}'::jsonb,
    form_data JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    review_comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance and query optimization
CREATE INDEX IF NOT EXISTS idx_faculty_assessments_user_id ON faculty_assessments(user_id);
-- One assessment per teacher per academic year (re-submitting updates it)
CREATE UNIQUE INDEX IF NOT EXISTS idx_faculty_assessments_user_year ON faculty_assessments(user_id, academic_year);
CREATE INDEX IF NOT EXISTS idx_faculty_assessments_year ON faculty_assessments(academic_year);
CREATE INDEX IF NOT EXISTS idx_faculty_assessments_dept ON faculty_assessments(department);
CREATE INDEX IF NOT EXISTS idx_faculty_assessments_status ON faculty_assessments(status);
CREATE INDEX IF NOT EXISTS idx_faculty_assessments_form_data ON faculty_assessments USING GIN (form_data);