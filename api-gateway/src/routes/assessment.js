const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// In-memory store fallback until direct PostgreSQL connection pool is initialized
const inMemoryAssessments = new Map();

/**
 * POST /api/assessments
 * Create or update faculty assessment
 */
router.post('/', async (req, res) => {
  try {
    const { formData, apiScores, academicYear } = req.body;

    if (!formData || typeof formData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid payload: formData object is required'
      });
    }

    if (!formData.name || !formData.name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: Faculty name is required'
      });
    }

    const assessmentId = req.body.id || crypto.randomUUID();
    const assessmentRecord = {
      id: assessmentId,
      academicYear: academicYear || '2023-2024',
      facultyName: formData.name.trim(),
      department: formData.department || 'Not specified',
      designation: formData.designation || 'Not specified',
      status: req.body.status || 'submitted',
      totalApiScore: apiScores?.total || 0,
      apiScores: apiScores || {},
      formData,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    inMemoryAssessments.set(assessmentId, assessmentRecord);

    console.log(`[Assessment Service] Saved assessment ${assessmentId} for ${assessmentRecord.facultyName}`);

    return res.status(200).json({
      success: true,
      message: 'Assessment recorded successfully',
      data: {
        id: assessmentId,
        status: assessmentRecord.status,
        facultyName: assessmentRecord.facultyName,
        totalApiScore: assessmentRecord.totalApiScore,
        submittedAt: assessmentRecord.submittedAt
      }
    });
  } catch (error) {
    console.error('[Assessment Service] Error saving assessment:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to record assessment'
    });
  }
});

/**
 * GET /api/assessments/:id
 * Retrieve specific assessment
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const assessment = inMemoryAssessments.get(id);

  if (!assessment) {
    return res.status(404).json({
      success: false,
      error: 'Assessment record not found'
    });
  }

  return res.json({
    success: true,
    data: assessment
  });
});

/**
 * GET /api/assessments
 * List assessments
 */
router.get('/', (req, res) => {
  const list = Array.from(inMemoryAssessments.values()).map(
    ({ id, academicYear, facultyName, department, designation, status, totalApiScore, submittedAt }) => ({
      id,
      academicYear,
      facultyName,
      department,
      designation,
      status,
      totalApiScore,
      submittedAt
    })
  );

  return res.json({
    success: true,
    count: list.length,
    data: list
  });
});

module.exports = router;
