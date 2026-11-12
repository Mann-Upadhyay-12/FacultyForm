const express = require('express');
const crypto = require('crypto');
const db = require('../db');

const router = express.Router();

// Used only when DATABASE_URL is not configured (local development).
const memory = new Map();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const YEAR_RE = /^\d{4}-\d{4}$/;
const clip = (v, n) => String(v ?? '').trim().slice(0, n);

/**
 * Reading submissions exposes every teacher's data, so it needs the admin key
 * (header `x-admin-key`). Without ADMIN_API_KEY it is only open outside production.
 */
function requireAdmin(req, res, next) {
  const key = process.env.ADMIN_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== 'production') return next();
    return res.status(503).json({ success: false, error: 'Admin access is disabled: set ADMIN_API_KEY on the server.' });
  }
  const given = String(req.get('x-admin-key') || '');
  const ok = given.length === key.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(key));
  if (!ok) return res.status(401).json({ success: false, error: 'Missing or invalid admin key' });
  return next();
}

function storageUnavailable(res) {
  return res.status(503).json({
    success: false,
    error: 'Database is not reachable right now. Your draft is safe in your browser — please try again in a minute.',
  });
}

/**
 * POST /api/assessments
 * Create a submission, or update it when the client re-submits with the id it was given.
 */
router.post('/', async (req, res, next) => {
  try {
    const { formData, apiScores, academicYear } = req.body || {};

    if (!formData || typeof formData !== 'object' || Array.isArray(formData)) {
      return res.status(400).json({ success: false, error: 'Invalid payload: formData object is required' });
    }
    if (typeof formData.name !== 'string' || !formData.name.trim()) {
      return res.status(400).json({ success: false, error: 'Validation failed: Faculty name is required' });
    }

    const year = YEAR_RE.test(String(academicYear || formData.academicYear || ''))
      ? String(academicYear || formData.academicYear)
      : null;
    if (!year) {
      return res.status(400).json({ success: false, error: 'Validation failed: academicYear must look like 2025-2026' });
    }

    const total = Number(apiScores?.total);
    const record = {
      academicYear: year,
      facultyName: clip(formData.name, 150),
      department: clip(formData.department, 100) || 'Not specified',
      designation: clip(formData.designation, 100) || 'Not specified',
      status: 'submitted',
      totalApiScore: Number.isFinite(total) && total >= 0 ? Math.round(total * 100) / 100 : 0,
      apiScores: apiScores && typeof apiScores === 'object' ? apiScores : {},
      formData,
    };
    const requestedId = UUID_RE.test(String(req.body.id || '')) ? String(req.body.id) : null;
    const now = new Date().toISOString();

    let saved;
    if (db.configured()) {
      if (!db.isReady()) return storageUnavailable(res);
      const params = [
        record.academicYear,
        record.facultyName,
        record.department,
        record.designation,
        record.status,
        record.totalApiScore,
        JSON.stringify(record.apiScores),
        JSON.stringify(record.formData),
      ];
      let result = { rows: [] };
      if (requestedId) {
        result = await db.query(
          `UPDATE faculty_assessments
              SET academic_year=$1, faculty_name=$2, department=$3, designation=$4, status=$5,
                  total_api_score=$6, api_breakdown=$7, form_data=$8, submitted_at=NOW(), updated_at=NOW()
            WHERE id=$9
        RETURNING id, status, faculty_name, total_api_score, submitted_at`,
          [...params, requestedId]
        );
      }
      if (!result.rows.length) {
        result = await db.query(
          `INSERT INTO faculty_assessments
             (academic_year, faculty_name, department, designation, status, total_api_score, api_breakdown, form_data, submitted_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
        RETURNING id, status, faculty_name, total_api_score, submitted_at`,
          params
        );
      }
      const row = result.rows[0];
      saved = {
        id: row.id,
        status: row.status,
        facultyName: row.faculty_name,
        totalApiScore: Number(row.total_api_score),
        submittedAt: new Date(row.submitted_at).toISOString(),
      };
    } else {
      const id = requestedId && memory.has(requestedId) ? requestedId : crypto.randomUUID();
      memory.set(id, { id, ...record, submittedAt: now, updatedAt: now });
      saved = { id, status: record.status, facultyName: record.facultyName, totalApiScore: record.totalApiScore, submittedAt: now };
    }

    console.log(`[assessments] saved ${saved.id} (${record.department}, ${record.academicYear})`);
    return res.status(200).json({ success: true, message: 'Assessment recorded successfully', data: saved });
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/assessments            (admin) list, optional ?year=2025-2026&department=HSS
 * GET /api/assessments/:id        (admin) full record
 */
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const year = YEAR_RE.test(String(req.query.year || '')) ? String(req.query.year) : null;
    const department = req.query.department ? clip(req.query.department, 100) : null;

    let list;
    if (db.configured()) {
      if (!db.isReady()) return storageUnavailable(res);
      const { rows } = await db.query(
        `SELECT id, academic_year, faculty_name, department, designation, status, total_api_score, submitted_at
           FROM faculty_assessments
          WHERE ($1::text IS NULL OR academic_year = $1) AND ($2::text IS NULL OR department = $2)
          ORDER BY submitted_at DESC NULLS LAST
          LIMIT 1000`,
        [year, department]
      );
      list = rows.map((r) => ({
        id: r.id,
        academicYear: r.academic_year,
        facultyName: r.faculty_name,
        department: r.department,
        designation: r.designation,
        status: r.status,
        totalApiScore: Number(r.total_api_score),
        submittedAt: r.submitted_at,
      }));
    } else {
      list = Array.from(memory.values())
        .filter((a) => (!year || a.academicYear === year) && (!department || a.department === department))
        .map(({ id, academicYear, facultyName, department: d, designation, status, totalApiScore, submittedAt }) => ({
          id,
          academicYear,
          facultyName,
          department: d,
          designation,
          status,
          totalApiScore,
          submittedAt,
        }));
    }
    return res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!UUID_RE.test(id)) return res.status(404).json({ success: false, error: 'Assessment record not found' });

    let record = null;
    if (db.configured()) {
      if (!db.isReady()) return storageUnavailable(res);
      const { rows } = await db.query('SELECT * FROM faculty_assessments WHERE id = $1', [id]);
      if (rows[0]) {
        const r = rows[0];
        record = {
          id: r.id,
          academicYear: r.academic_year,
          facultyName: r.faculty_name,
          department: r.department,
          designation: r.designation,
          status: r.status,
          totalApiScore: Number(r.total_api_score),
          apiScores: r.api_breakdown,
          formData: r.form_data,
          submittedAt: r.submitted_at,
          updatedAt: r.updated_at,
        };
      }
    } else {
      record = memory.get(id) || null;
    }

    if (!record) return res.status(404).json({ success: false, error: 'Assessment record not found' });
    return res.json({ success: true, data: record });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
