-- Migration 02: Add Faculty Assessments Table
CREATE TABLE IF NOT EXISTS faculty_assessments (
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

CREATE INDEX IF NOT EXISTS idx_faculty_assessments_user_id ON faculty_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_faculty_assessments_year ON faculty_assessments(academic_year);
CREATE INDEX IF NOT EXISTS idx_faculty_assessments_dept ON faculty_assessments(department);
CREATE INDEX IF NOT EXISTS idx_faculty_assessments_status ON faculty_assessments(status);
CREATE INDEX IF NOT EXISTS idx_faculty_assessments_form_data ON faculty_assessments USING GIN (form_data);
