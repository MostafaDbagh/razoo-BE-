/**
 * Express application setup
 * Middleware, routes, CORS, and error handling
 */
const express = require('express');
const cors = require('cors');
const loggingMiddleware = require('./middlewares/logging');
const errorHandler = require('./middlewares/errorHandler');
const analyzeRoutes = require('./routes/analyzeRoutes');
const tryonRoutes = require('./routes/tryonRoutes');
const previewRoutes = require('./routes/previewRoutes');
const bookRoutes = require('./routes/bookRoutes');
const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');
const adminOrdersRoutes = require('./routes/adminOrdersRoutes');
const orderService = require('./services/orderService');

const app = express();

// CORS configuration - restrict origins in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN?.split(',') || false
    : true, // Allow all in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Body parser for JSON (for optional user_id etc.)
app.use(express.json({ limit: '1mb' }));

// Request logging
app.use(loggingMiddleware);

// Health check (includes MongoDB status when available)
app.get('/health', async (req, res) => {
  const mongo = await orderService.checkConnection();
  res.json({
    status: 'ok',
    service: 'haircut-ai-backend',
    mongo: mongo.status,
    ...(mongo.message && { mongoMessage: mongo.message }),
  });
});

// API routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api/tryon', tryonRoutes);
app.use('/api/hairstyle-preview', previewRoutes);
app.use('/api/book', bookRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminOrdersRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not Found', message: `Route ${req.method} ${req.path} not found` });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
