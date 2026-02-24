/**
 * Analyze routes
 * POST /api/analyze - Upload image and get face analysis
 */
const express = require('express');
const router = express.Router();
const analyzeController = require('../controllers/analyzeController');
const upload = require('../middlewares/upload');
const validateImage = require('../middlewares/validateImage');

// POST /api/analyze - single file upload, field name 'image'
router.post(
  '/',
  upload.single('image'),
  validateImage,
  analyzeController.analyze
);

module.exports = router;
