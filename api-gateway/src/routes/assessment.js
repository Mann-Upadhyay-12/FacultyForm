const express = require('express');
const { pool } = require('../db');
const { requireAuth, requireAdmin, authError } = require('../auth');

const router = express.Router();
const DEFAULT_YEAR = '2023-2024';

router.use(requireAuth);

function toRecord(row) {
  return {
    id: row.id,
    academicYear: row.academic_year,
    facultyName: row.faculty_name,
    department: row.department,
    designation: row.designation,
    status: row.status,
    totalApiScore: Number(row.total_api_score),
    apiScores: row.api_breakdown,
    formData: row.form_data,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at
  };
}

/**
 * Upserts the signed-in teacher's assessment for an academic year.
 * The owner always comes from the session, never from the request body.
 */
async function saveAssessment(req, res, status) {
  const { formData, apiScores } = req.body || {};
  const academicYear = (req.body?.academicYear || DEFAULT_YEAR).toString().slice(0, 20);

  if (!formData || typeof formData !== 'object' || Array.isArray(formData)) {
    return res.status(400).json({ success: false, error: 'Invalid payload: formData object is required' });
  }
  const name = typeof formData.name === 'string' ? formData.name.trim() : '';
  if (status === 'submitted' && !name) {
    return res.status(400).json({ success: false, error: 'Validation failed: Faculty name is required' });
  }

  const { rows } = await pool.query(
    `INSERT INTO faculty_assessments
       (user_id, academic_year, faculty_name, department, designation, status,
        total_api_score, api_breakdown, form_data, submitted_at)
     VALUES ($1, $2, $3, $4, $5, $6::varchar, $7, $8, $9, CASE WHEN $6::varchar = 'submitted' THEN NOW() END)
     ON CONFLICT (user_id, academic_year) DO UPDATE SET
       faculty_name    = EXCLUDED.faculty_name,
       department      = EXCLUDED.department,
       designation     = EXCLUDED.designation,
       -- saving a draft never downgrades an already-submitted assessment
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
      academicYear,
      (name || 'Not specified').slice(0, 150),
      String(formData.department || 'Not specified').slice(0, 100),
      String(formData.designation || 'Not specified').slice(0, 100),
      status,
      Number(apiScores?.total) || 0,
      JSON.stringify(apiScores || {}),
      JSON.stringify(formData)
    ]
  );

  // Keep the account's display name in sync with the name entered on the form.
  if (name) {
    const [first, ...rest] = name.split(/\s+/);
    await pool.query(
      'UPDATE users SET first_name = $2, last_name = $3, updated_at = NOW() WHERE user_id = $1',
      [req.user.id, first.slice(0, 100), rest.join(' ').slice(0, 100) || null]
    );
  }

  const record = toRecord(rows[0]);
  console.log(`[Assessment] ${status} saved ${record.id} for user ${req.user.id}`);
  return res.json({ success: true, message: 'Assessment recorded successfully', data: record });
}

/** GET /api/assessments/me — the signed-in teacher's own assessment (or null). */
router.get('/me', async (req, res, next) => {
  try {
    const academicYear = (req.query.academicYear || DEFAULT_YEAR).toString();
    const { rows } = await pool.query(
      'SELECT * FROM faculty_assessments WHERE user_id = $1 AND academic_year = $2',
      [req.user.id, academicYear]
    );
    res.json({ success: true, data: rows[0] ? toRecord(rows[0]) : null });
  } catch (err) {
    next(err);
  }
});

/** PUT /api/assessments/me — save draft to the account. */
router.put('/me', (req, res, next) => saveAssessment(req, res, 'draft').catch(next));

/** POST /api/assessments — final submission. */
router.post('/', (req, res, next) => saveAssessment(req, res, 'submitted').catch(next));

/** GET /api/assessments — admin-only overview (admins are assigned via SQL). */
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.id, a.academic_year, a.faculty_name, a.department, a.designation, a.status,
              a.total_api_score, a.submitted_at, u.email
         FROM faculty_assessments a
         LEFT JOIN users u ON u.user_id = a.user_id
        ORDER BY a.updated_at DESC`
    );
    res.json({
      success: true,
      count: rows.length,
      data: rows.map((r) => ({
        id: r.id,
        academicYear: r.academic_year,
        facultyName: r.faculty_name,
        email: r.email,
        department: r.department,
        designation: r.designation,
        status: r.status,
        totalApiScore: Number(r.total_api_score),
        submittedAt: r.submitted_at
      }))
    });
  } catch (err) {
    next(err);
  }
});

/** GET /api/assessments/:id — owner or admin only. */
router.get('/:id', async (req, res, next) => {
  try {
    if (!/^[0-9a-f-]{36}$/i.test(req.params.id)) {
      return res.status(404).json({ success: false, error: 'Assessment record not found' });
    }
    const { rows } = await pool.query('SELECT * FROM faculty_assessments WHERE id = $1', [req.params.id]);
    const row = rows[0];
    if (!row) return res.status(404).json({ success: false, error: 'Assessment record not found' });
    if (row.user_id !== req.user.id && req.user.role !== 'admin') {
      return authError(res, 403, 'FORBIDDEN', 'You do not have access to this assessment.');
    }
    res.json({ success: true, data: toRecord(row) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
