const express = require('express');
const db = require('../db');
const {
  hashPassword,
  verifyPassword,
  dummyHash,
  createSession,
  revokeSession,
  publicUser,
  requireAuth,
  requireDb,
  authError
} = require('../auth');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;

function readCredentials(body) {
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  return { email, password };
}

/**
 * POST /api/auth/register
 * Creates a teacher account (role is always 'faculty') and starts a session.
 */
router.post('/register', requireDb, async (req, res, next) => {
  try {
    const { email, password } = readCredentials(req.body);

    if (!EMAIL_RE.test(email) || email.length > 255) {
      return authError(res, 400, 'INVALID_EMAIL', 'Please enter a valid email address.');
    }
    if (password.length < MIN_PASSWORD) {
      return authError(res, 400, 'WEAK_PASSWORD', `Password must be at least ${MIN_PASSWORD} characters.`);
    }
    if (password.length > MAX_PASSWORD) {
      return authError(res, 400, 'WEAK_PASSWORD', `Password must be at most ${MAX_PASSWORD} characters.`);
    }

    const passwordHash = await hashPassword(password);
    let user;
    try {
      const { rows } = await db.query(
        `INSERT INTO users (email, password_hash, role, last_login_at)
         VALUES ($1, $2, 'faculty', NOW())
         RETURNING user_id, email, first_name, last_name, role`,
        [email, passwordHash]
      );
      user = rows[0];
    } catch (err) {
      if (err.code === '23505') {
        return authError(res, 409, 'EMAIL_TAKEN', 'An account with this email already exists. Please log in instead.');
      }
      throw err;
    }

    const session = await createSession(user.user_id, req.headers['user-agent']);
    return res.status(201).json({
      success: true,
      token: session.token,
      expiresAt: session.expiresAt,
      user: publicUser(user)
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', requireDb, async (req, res, next) => {
  try {
    const { email, password } = readCredentials(req.body);
    if (!email || !password) {
      return authError(res, 400, 'MISSING_CREDENTIALS', 'Email and password are required.');
    }

    const { rows } = await db.query(
      `SELECT user_id, email, password_hash, first_name, last_name, role
         FROM users WHERE LOWER(email) = $1`,
      [email]
    );
    const user = rows[0];
    const ok = await verifyPassword(password, user ? user.password_hash : await dummyHash());
    if (!user || !ok) {
      return authError(res, 401, 'INVALID_CREDENTIALS', 'Incorrect email or password.');
    }

    await db.query('UPDATE users SET last_login_at = NOW() WHERE user_id = $1', [user.user_id]);
    const session = await createSession(user.user_id, req.headers['user-agent']);
    return res.json({
      success: true,
      token: session.token,
      expiresAt: session.expiresAt,
      user: publicUser(user)
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/auth/me — validates the stored session on app load.
 */
router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

/**
 * POST /api/auth/logout — revokes the current session server-side.
 */
router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    await revokeSession(req.sessionToken);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
