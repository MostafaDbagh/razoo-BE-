/**
 * Application configuration
 */
require('dotenv').config();

module.exports = {
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    env: process.env.NODE_ENV || 'development',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  upload: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/haircut-ai',
  },
};
