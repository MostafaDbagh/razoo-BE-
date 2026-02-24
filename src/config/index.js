/**
 * Application configuration - loads from environment variables
 * All sensitive and environment-specific config centralized here
 */
require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
  },
  aiService: {
    url: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB default
    allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/webp').split(','),
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || null,
  },
  mongo: {
    uri: process.env.MONGO_URI || null,
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'admin',
    secret: process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || 'change-me-in-production',
  },
};
