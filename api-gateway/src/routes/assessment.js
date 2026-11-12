const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { requireAuth } = require('../auth');

const router = express.Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const YEAR_RE = /^\d{4}-\d{4}$/;
const clip = (v, n) => String(v ?? '').trim().slice(0, n);

/**
 * Reading every teacher's submissions needs either the admin key (header
 * `x-admin-key`) or a logged-in account whose role was set to 'admin' via SQL.
 * Without ADMIN_API_KEY, key access is only open outside production.
 */
function requireAdmin(req, res, next) {
  const given = req.get('x-admin-key');
  if (given !== undefined || !req.get('authorization')) {
    const key = process.env.ADMIN_API_KEY;
    if (!key) {
      if (process.env.NODE_ENV !== 'production') return next();
      return res.status(503).json({ success: false, error: 'Admin access is disabled: set ADMIN_API_KEY on the server.' });
    }
    const value = String(given || '');
    const ok = value.length === key.length && crypto.timingSafeEqual(Buffer.from(value), Buffer.from(key));
    if (!ok) return res.status(401).json({ success: false, error: 'Missing or invalid admin key' });
    return next();
  }
  return requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, code: 'FORBIDDEN', error: 'You do not have access to this resource.' });
    }
    return next();
  });
}

function storageUnavailable(res) {
  return res.status(503).json({
    success: false,
    error: 'Database is not reachable right now. Your draft is safe in your browser — please try again in a minute.',
  });
}

function toRecord(r) {
  return {
    id: r.id,
    academicYear: r.academic_year,
    facultyName: r.faculty_name,
    department: r.department,
    designation: r.designation,
    status: r.status,
    totalApiScore: Number(r.total_api_score),
    apiScores: r.api_breakdown,
    formData: r.form_data,
    submittedAt: r.submitted_at ? new Date(r.submitted_at).toISOString() : null,
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : null,
  };
}

function readYear(value) {
  const year = String(value || '');
  return YEAR_RE.test(year) ? year : null;
}

/**
 * Saves the signed-in teacher's assessment for one academic year (one row per
 * teacher per year). The owner always comes from the session, never the body.
 */
async function saveForUser(req, res, status) {
  const { formData, apiScores, academicYear } = req.body || {};

  if (!formData || typeof formData !== 'object' || Array.isArray(formData)) {
    return res.status(400).json({ success: false, error: 'Invalid payload: formData object is required' });
  }
  const name = typeof formData.name === 'string' ? formData.name.trim() : '';
  if (status === 'submitted' && !name) {
    return res.status(400).json({ success: false, error: 'Validation failed: Faculty name is required' });
  }
  const year = readYear(academicYear || formData.academicYear);
  if (!year) {
    return res.status(400).json({ success: false, error: 'Validation failed: academicYear must look like 2025-2026' });
  }
  if (!db.isReady()) return storageUnavailable(res);

  const total = Number(apiScores?.total);
  const { rows } = await db.query(
    `INSERT INTO faculty_assessments
       (user_id, academic_year, faculty_name, department, designation, status,
        total_api_score, api_breakdown, form_data, submitted_at)
     VALUES ($1, $2, $3, $4, $5, $6::varchar, $7, $8, $9,
             CASE WHEN $6::varchar = 'submitted' THEN NOW() END)
     ON CONFLICT (user_id, academic_year) DO UPDATE SET
       faculty_name    = EXCLUDED.faculty_name,
       department      = EXCLUDED.department,
       designation     = EXCLUDED.designation,
       -- saving a draft never turns a submitted assessment back into a draft
       status          = CASE WHEN EXCLUDED.status = 'submitted' THEN 'submitted'
                              ELSE faculty_assessments.status END,
       total_api_score = EXCLUDED.total_api_score,
       api_breakdown   = EXCLUDED.api_breakdown,
       form_data       = EXCLUDED.form_data,
       submitted_at    = CASE WHEN EXCLUDED.status = 'submitted' THEN NOW()
                              ELSE faculty_assessments.submitted_at END,
       updated_at      = NOW()
     RETURNING *`,
    [
      req.user.id,
      year,
      clip(name, 150) || 'Not specified',
      clip(formData.department, 100) || 'Not specified',
      clip(formData.designation, 100) || 'Not specified',
      status,
      Number.isFinite(total) && total >= 0 ? Math.round(total * 100) / 100 : 0,
      JSON.stringify(apiScores && typeof apiScores === 'object' ? apiScores : {}),
      JSON.stringify(formData),
    ]
  );

  // Keep the account's display name in sync with the name on the form.
  if (name) {
    const [first, ...rest] = name.split(/\s+/);
    await db.query('UPDATE users SET first_name = $2, last_name = $3, updated_at = NOW() WHERE user_id = $1', [
      req.user.id,
      first.slice(0, 100),
      rest.join(' ').slice(0, 100) || null,
    ]);
  }

  const record = toRecord(rows[0]);
  console.log(`[assessments] ${status} saved ${record.id} (${record.department}, ${record.academicYear})`);
  return res.json({ success: true, message: 'Assessment recorded successfully', data: record });
}

/** GET /api/assessments/me?academicYear=2025-2026 — the teacher's own assessment, or null. */
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    if (!db.isReady()) return storageUnavailable(res);
    const year = readYear(req.query.academicYear);
    const { rows } = await db.query(
      `SELECT * FROM faculty_assessments
        WHERE user_id = $1 AND ($2::text IS NULL OR academic_year = $2)
        ORDER BY updated_at DESC NULLS LAST
        LIMIT 1`,
      [req.user.id, year]
    );
    return res.json({ success: true, data: rows[0] ? toRecord(rows[0]) : null });
  } catch (error) {
    return next(error);
  }
});

/** PUT /api/assessments/me — save a draft to the account. */
router.put('/me', requireAuth, (req, res, next) => saveForUser(req, res, 'draft').catch(next));

/** POST /api/assessments — final submission (re-submitting updates the same record). */
router.post('/', requireAuth, (req, res, next) => saveForUser(req, res, 'submitted').catch(next));

/**
 * GET /api/assessments            (admin) list, optional ?year=2025-2026&department=HSS
 * GET /api/assessments/:id        (admin) full record
 */
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    if (!db.isReady()) return storageUnavailable(res);
    const year = readYear(req.query.year);
    const department = req.query.department ? clip(req.query.department, 100) : null;
    const { rows } = await db.query(
      `SELECT a.id, a.academic_year, a.faculty_name, a.department, a.designation, a.status,
              a.total_api_score, a.submitted_at, u.email
         FROM faculty_assessments a
         LEFT JOIN users u ON u.user_id = a.user_id
        WHERE ($1::text IS NULL OR a.academic_year = $1) AND ($2::text IS NULL OR a.department = $2)
        ORDER BY a.submitted_at DESC NULLS LAST
        LIMIT 1000`,
      [year, department]
    );
    const list = rows.map((r) => ({
      id: r.id,
      academicYear: r.academic_year,
      facultyName: r.faculty_name,
      email: r.email || null,
      department: r.department,
      designation: r.designation,
      status: r.status,
      totalApiScore: Number(r.total_api_score),
      submittedAt: r.submitted_at,
    }));
    return res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!UUID_RE.test(id)) return res.status(404).json({ success: false, error: 'Assessment record not found' });
    if (!db.isReady()) return storageUnavailable(res);
    const { rows } = await db.query('SELECT * FROM faculty_assessments WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Assessment record not found' });
    return res.json({ success: true, data: toRecord(rows[0]) });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
