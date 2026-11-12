const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { ensureSchema } = require('./db');

const app = express();

// Render / Railway / Vercel sit behind a proxy; needed for correct client IPs in rate limiting.
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('CORS request blocked by API Gateway policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Stricter Rate Limiter for Authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 failed attempts per 15 minutes
  // Only failures count, so many teachers behind one campus IP aren't locked out.
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many login attempts, please try again later'
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'API Gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const routes = require('./routes');

// Apply routes with rate limiting
app.use(['/api/auth/login', '/api/auth/register'], authLimiter);
app.use('/api', apiLimiter, routes);

// 404 handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[API Gateway Error]:', err.stack || err.message);
  // Database unreachable → tell the client it's temporary rather than a generic 500.
  const dbDown = ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', '57P01', '3D000', '28P01'].includes(err.code);
  if (dbDown) {
    return res.status(503).json({ success: false, error: 'Service temporarily unavailable. Please try again shortly.' });
  }
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : (err.message || 'Server error')
  });
});

const PORT = process.env.PORT || 5000;
let server;
ensureSchema()
  .then(() => console.log('[DB] Schema verified'))
  .catch((err) => console.error('[DB] Schema setup failed — auth and assessments will be unavailable:', err.message))
  .finally(() => {
    server = app.listen(PORT, () => {
      console.log(`🚀 API Gateway running on port ${PORT}`);
    });
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server...');
  if (server) server.close(() => {
    console.log('HTTP server closed.');
  });
});

module.exports = app;
