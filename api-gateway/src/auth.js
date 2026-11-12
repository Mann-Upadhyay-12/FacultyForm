const crypto = require('crypto');
const { promisify } = require('util');
const { pool } = require('./db');

const scrypt = promisify(crypto.scrypt);

const SESSION_TTL_DAYS = Number(process.env.SESSION_TTL_DAYS || 30);
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEY_LEN = 64;

// ---------------------------------------------------------------------------
// Passwords: scrypt with a per-user random salt. Format: scrypt$N$r$p$salt$hash
// ---------------------------------------------------------------------------
async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derived = await scrypt(password, salt, KEY_LEN, SCRYPT_PARAMS);
  const { N, r, p } = SCRYPT_PARAMS;
  return `scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${derived.toString('base64')}`;
}

async function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false;
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false; // e.g. seed rows with placeholder hashes
  const [, N, r, p, saltB64, hashB64] = parts;
  const expected = Buffer.from(hashB64, 'base64');
  const derived = await scrypt(password, Buffer.from(saltB64, 'base64'), expected.length, {
    N: Number(N), r: Number(r), p: Number(p), maxmem: SCRYPT_PARAMS.maxmem
  });
  return expected.length === derived.length && crypto.timingSafeEqual(expected, derived);
}

// A real hash to compare against when the email doesn't exist, so response
// timing doesn't reveal which emails are registered.
let dummyHashPromise;
function dummyHash() {
  if (!dummyHashPromise) dummyHashPromise = hashPassword(crypto.randomBytes(16).toString('hex'));
  return dummyHashPromise;
}

// ---------------------------------------------------------------------------
// Sessions: opaque random tokens; only their SHA-256 is stored server-side,
// so a database leak doesn't expose usable tokens. Sessions can be revoked.
// ---------------------------------------------------------------------------
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

async function createSession(userId, userAgent) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await pool.query(
    `INSERT INTO user_sessions (user_id, token_hash, expires_at, user_agent)
     VALUES ($1, $2, $3, $4)`,
    [userId, sha256(token), expiresAt, (userAgent || '').slice(0, 500)]
  );
  return { token, expiresAt };
}

async function revokeSession(token) {
  await pool.query('DELETE FROM user_sessions WHERE token_hash = $1', [sha256(token)]);
}

function publicUser(row) {
  return {
    id: row.user_id,
    email: row.email,
    name: [row.first_name, row.last_name].filter(Boolean).join(' ') || null,
    role: row.role
  };
}

function authError(res, status, code, error) {
  return res.status(status).json({ success: false, code, error });
}

function extractToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, value] = header.split(' ');
  return scheme === 'Bearer' && value ? value : null;
}

/**
 * Middleware: rejects the request unless it carries a valid, unexpired session.
 * Sliding expiry: active sessions are extended so regular users stay signed in.
 */
async function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return authError(res, 401, 'AUTH_REQUIRED', 'Please log in to continue.');

  try {
    const { rows } = await pool.query(
      `SELECT s.id AS session_id, s.expires_at, s.last_used_at,
              u.user_id, u.email, u.first_name, u.last_name, u.role
         FROM user_sessions s
         JOIN users u ON u.user_id = s.user_id
        WHERE s.token_hash = $1`,
      [sha256(token)]
    );
    const row = rows[0];
    if (!row) return authError(res, 401, 'SESSION_INVALID', 'Your session is no longer valid. Please log in again.');

    if (new Date(row.expires_at).getTime() <= Date.now()) {
      // Row is left for the boot-time cleanup so repeat checks keep reporting "expired".
      return authError(res, 401, 'SESSION_EXPIRED', 'Your session has expired. Please log in again.');
    }

    // Extend at most once an hour to avoid a write on every request.
    if (Date.now() - new Date(row.last_used_at).getTime() > 60 * 60 * 1000) {
      await pool.query(
        'UPDATE user_sessions SET last_used_at = NOW(), expires_at = $2 WHERE id = $1',
        [row.session_id, new Date(Date.now() + SESSION_TTL_MS)]
      );
    }

    req.user = publicUser(row);
    req.sessionToken = token;
    return next();
  } catch (err) {
    return next(err);
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return authError(res, 403, 'FORBIDDEN', 'You do not have access to this resource.');
  return next();
}

module.exports = {
  hashPassword,
  verifyPassword,
  dummyHash,
  createSession,
  revokeSession,
  publicUser,
  requireAuth,
  requireAdmin,
  authError
};
