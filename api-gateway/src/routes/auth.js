const express = require('express');
const axios = require('axios');
const router = express.Router();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8004';
const client = axios.create({
  baseURL: AUTH_SERVICE_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' }
});

// Proxy login
router.post('/login', async (req, res) => {
  try {
    const response = await client.post('/login', req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || (error.code === 'ECONNREFUSED' ? 503 : 500);
    const message = error.response?.data || {
      success: false,
      error: error.code === 'ECONNREFUSED' ? 'Auth service currently unavailable' : (error.message || 'Authentication error')
    };
    return res.status(status).json(message);
  }
});

// Proxy token refresh
router.post('/token', async (req, res) => {
  try {
    const response = await client.post('/token', req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || (error.code === 'ECONNREFUSED' ? 503 : 500);
    const message = error.response?.data || {
      success: false,
      error: error.code === 'ECONNREFUSED' ? 'Auth service currently unavailable' : (error.message || 'Token refresh error')
    };
    return res.status(status).json(message);
  }
});

// Proxy logout
router.delete('/logout', async (req, res) => {
  try {
    const response = await client.delete('/logout', { data: req.body });
    return res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || (error.code === 'ECONNREFUSED' ? 503 : 500);
    const message = error.response?.data || {
      success: false,
      error: error.code === 'ECONNREFUSED' ? 'Auth service currently unavailable' : (error.message || 'Logout error')
    };
    return res.status(status).json(message);
  }
});

module.exports = router;
