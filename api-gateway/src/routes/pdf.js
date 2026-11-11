const express = require('express');
const axios = require('axios');
const router = express.Router();

const PDF_HOSTING_SERVICE_URL = process.env.PDF_HOSTING_SERVICE_URL || 'http://localhost:8006';
const client = axios.create({
  baseURL: PDF_HOSTING_SERVICE_URL,
  timeout: 15000
});

router.post('/upload', async (req, res) => {
  try {
    const response = await client.post('/upload', req.body, {
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
        ...(req.headers.authorization && { Authorization: req.headers.authorization })
      }
    });
    return res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || (error.code === 'ECONNREFUSED' ? 503 : 500);
    return res.status(status).json(
      error.response?.data || {
        success: false,
        error: error.code === 'ECONNREFUSED' ? 'PDF hosting service currently unavailable' : (error.message || 'Error occurred')
      }
    );
  }
});

module.exports = router;
