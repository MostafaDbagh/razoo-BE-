/**
 * AI Service client
 * Communicates with Python FastAPI service for face analysis
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const config = require('../config');

/**
 * Send image to AI service for face analysis
 * @param {string} imagePath - Absolute path to the image file
 * @param {string} [hairLength] - short | medium | long - filters to achievable styles
 * @returns {Promise<Object>} Analysis result with face_shape, confidence, suggestions
 */
async function analyzeFace(imagePath, hairLength = 'short') {
  const fullPath = path.isAbsolute(imagePath) ? imagePath : path.join(__dirname, '../../', imagePath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Image file not found: ${fullPath}`);
  }

  const formData = new FormData();
  formData.append('image', fs.createReadStream(fullPath));
  formData.append('hair_length', hairLength);

  const response = await axios.post(`${config.aiService.url}/analyze`, formData, {
    headers: {
      ...formData.getHeaders(),
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 90000, // 90 second timeout (first request may load model; later ones are fast)
  });

  return response.data;
}

async function getTryonStatus() {
  const response = await axios.get(`${config.aiService.url}/tryon/status`);
  return response.data;
}

async function getHairstylePreview(style) {
  const encoded = encodeURIComponent(style);
  const response = await axios.get(`${config.aiService.url}/hairstyle-preview/${encoded}`, {
    timeout: 30000,
  });
  return response.data;
}

async function generateTryon(imagePath, style) {
  const fullPath = path.isAbsolute(imagePath) ? imagePath : path.join(__dirname, '../../', imagePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Image file not found: ${fullPath}`);
  const formData = new FormData();
  formData.append('image', fs.createReadStream(fullPath));
  formData.append('style', style);
  const response = await axios.post(`${config.aiService.url}/tryon`, formData, {
    headers: { ...formData.getHeaders() },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 300000,
  });
  return response.data;
}

module.exports = {
  analyzeFace,
  getTryonStatus,
  generateTryon,
  getHairstylePreview,
};
