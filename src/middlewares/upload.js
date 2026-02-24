/**
 * Multer configuration for file uploads
 * Handles image file storage with size and type constraints
 */
const path = require('path');
const multer = require('multer');
const config = require('../config');

// Storage configuration - saves to uploads folder with unique filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `analysis-${uniqueSuffix}${ext}`);
  },
});

// File filter - only allow specified image types
const fileFilter = (req, file, cb) => {
  const allowedTypes = config.upload.allowedMimeTypes;
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: JPEG, PNG, WebP'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 1,
  },
});

module.exports = upload;
