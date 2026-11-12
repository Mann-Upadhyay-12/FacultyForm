/**
 * PostgreSQL access for teacher accounts, login sessions and assessments.
 *
 * Works with any Postgres URL (Neon, Supabase, AWS RDS, local Docker).
 * DATABASE_URL is required: login and submissions are unavailable without it.
 */
const { Pool } = require('pg');

let pool = null;
let status = process.env.DATABASE_URL ? 'connecting' : 'not configured';
let lastError = null;

/** Strip libpq-only query params; TLS is configured explicitly below. */
function buildConfig(url) {
  const parsed = new URL(url);
  const sslmode = parsed.searchParams.get('sslmode');
  ['sslmode', 'channel_binding', 'sslrootcert', 'sslcert', 'sslkey'].forEach((k) => parsed.searchParams.delete(k));

  const wantSsl = process.env.DB_SSL ? process.env.DB_SSL === 'true' : Boolean(sslmode && sslmode !== 'disable');
  return {
    connectionString: parsed.toString(),
    // DB_SSL_VERIFY=false is needed for AWS RDS unless you install its CA bundle.
    ssl: wantSsl ? { rejectUnauthorized: process.env.DB_SSL_VERIFY !== 'false' } : false,
    max: Number(process.env.DB_POOL_MAX || 5),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  };
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS faculty_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    academic_year VARCHAR(20) NOT NULL,
    faculty_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    total_api_score NUMERIC(8, 2) DEFAULT 0.00,
    api_breakdown JSONB DEFAULT '{}'::jsonb,
    form_data JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID,
    review_comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_faculty_assessments_year ON faculty_assessments(academic_year);
CREATE INDEX IF NOT EXISTS idx_faculty_assessments_dept ON faculty_assessments(department);

-- Teacher accounts. Everyone who signs up is 'faculty'; promote admins manually:
--   UPDATE users SET role = 'admin' WHERE email = 'someone@juit.ac.in';
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
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'faculty';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));

-- Login sessions. Only a SHA-256 of each token is stored.
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
DELETE FROM user_sessions WHERE expires_at < NOW() - INTERVAL '1 day';

-- One assessment per teacher per academic year; re-submitting updates it.
-- Rows submitted before accounts existed keep user_id NULL and are unaffected.
CREATE INDEX IF NOT EXISTS idx_faculty_assessments_user_id ON faculty_assessments(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_faculty_assessments_user_year ON faculty_assessments(user_id, academic_year);
`;

async function init() {
  if (!process.env.DATABASE_URL) {
    console.warn('[db] DATABASE_URL not set — login and submissions are disabled until it is configured.');
    return;
  }
  if (pool) {
    await pool.end().catch(() => {});
    pool = null;
  }
  try {
    pool = new Pool(buildConfig(process.env.DATABASE_URL));
    pool.on('error', (err) => {
      lastError = err.message;
      console.error('[db] idle client error:', err.message);
    });
    await pool.query(SCHEMA);
    status = 'connected';
    lastError = null;
    console.log('[db] connected, schema ready');
  } catch (err) {
    status = 'error';
    lastError = err.message;
    console.error('[db] initialisation failed:', err.message);
    // Retry in the background; free databases (Neon) may be waking up.
    setTimeout(init, 15000);
  }
}

function health() {
  return { status, ...(lastError ? { error: lastError } : {}) };
}

function isReady() {
  return status === 'connected' && pool !== null;
}

function query(text, params) {
  if (!pool) throw new Error('Database not initialised');
  return pool.query(text, params);
}

async function close() {
  if (pool) await pool.end();
}

module.exports = { init, health, isReady, query, close, configured: () => Boolean(process.env.DATABASE_URL) };
