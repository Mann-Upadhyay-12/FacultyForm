const express = require('express');
const axios = require('axios');
const router = express.Router();

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8005';
const client = axios.create({
  baseURL: NOTIFICATION_SERVICE_URL,
  timeout: 8000
});

router.get('/notifications', async (req, res) => {
  try {
    const response = await client.get('/notifications', {
      headers: {
        ...(req.headers.authorization && { Authorization: req.headers.authorization })
      }
    });
    return res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || (error.code === 'ECONNREFUSED' ? 503 : 500);
    return res.status(status).json(
      error.response?.data || {
        success: false,
        error: error.code === 'ECONNREFUSED' ? 'Notification service currently unavailable' : (error.message || 'Error occurred')
      }
    );
  }
});

module.exports = router;
