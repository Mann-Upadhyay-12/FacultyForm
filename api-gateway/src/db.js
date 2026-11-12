/**
 * PostgreSQL access for assessments.
 *
 * Works with any Postgres URL (Neon, Supabase, AWS RDS, local Docker).
 * If DATABASE_URL is not set the gateway falls back to an in-memory store,
 * which is fine for local development but loses data on every restart.
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
`;

async function init() {
  if (!process.env.DATABASE_URL) {
    console.warn('[db] DATABASE_URL not set — using in-memory storage (data is lost on restart).');
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
