-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'faculty', 'lab_manager', 'admin')),
    university_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
CREATE INDEX IF NOT EXISTS idx_faculty_assessments_year ON faculty_assessments(academic_year);
CREATE INDEX IF NOT EXISTS idx_faculty_assessments_dept ON faculty_assessments(department);
CREATE INDEX IF NOT EXISTS idx_faculty_assessments_status ON faculty_assessments(status);
CREATE INDEX IF NOT EXISTS idx_faculty_assessments_form_data ON faculty_assessments USING GIN (form_data);