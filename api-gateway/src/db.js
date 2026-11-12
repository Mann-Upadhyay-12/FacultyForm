const { Pool } = require('pg');

/**
 * Shared PostgreSQL pool.
 * Uses DATABASE_URL when present (Neon / Supabase / Render), otherwise the DB_* variables.
 */
function buildConfig() {
  const sslEnabled =
    process.env.DB_SSL === 'true' ||
    /sslmode=require/i.test(process.env.DATABASE_URL || '');
  const ssl = sslEnabled ? { rejectUnauthorized: false } : undefined;

  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL, ssl, max: 10 };
  }
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl,
    max: 10
  };
}

const pool = new Pool(buildConfig());

pool.on('error', (err) => {
  console.error('[DB] Unexpected idle client error:', err.message);
});

/**
 * Idempotent schema setup. Safe to run on every boot and on databases that
 * were already initialised from database/postgre/schemas/schema.sql.
 */
async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      role VARCHAR(50) NOT NULL DEFAULT 'faculty'
        CHECK (role IN ('student', 'faculty', 'lab_manager', 'admin')),
      university_id VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Every self-registered account is a teacher. Admins are promoted manually via SQL.
    ALTER TABLE users ALTER COLUMN role SET DEFAULT 'faculty';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));

    CREATE TABLE IF NOT EXISTS user_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      token_hash CHAR(64) NOT NULL UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      last_used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      user_agent TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

    CREATE TABLE IF NOT EXISTS faculty_assessments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
      academic_year VARCHAR(20) NOT NULL DEFAULT '2023-2024',
      faculty_name VARCHAR(150) NOT NULL,
      department VARCHAR(100) NOT NULL,
      designation VARCHAR(100) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved')),
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
    -- One assessment per teacher per academic year (re-submits update it in place).
    CREATE UNIQUE INDEX IF NOT EXISTS idx_faculty_assessments_user_year
      ON faculty_assessments(user_id, academic_year);
    CREATE INDEX IF NOT EXISTS idx_faculty_assessments_status ON faculty_assessments(status);
  `);

  // Housekeeping: drop sessions that expired more than a day ago.
  await pool.query(`DELETE FROM user_sessions WHERE expires_at < NOW() - INTERVAL '1 day'`);
}

module.exports = { pool, ensureSchema };
