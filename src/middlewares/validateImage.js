/**
 * Image validation middleware
 * Validates file presence and type before processing
 */
const config = require('../config');

const validateImage = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file provided',
      message: 'Please upload an image file (JPEG, PNG, or WebP)',
    });
  }

  // Validate MIME type (double-check, multer also does this)
  const allowedTypes = config.upload.allowedMimeTypes;
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type',
      message: `Allowed types: ${allowedTypes.join(', ')}`,
    });
  }

  // Validate file size
  if (req.file.size > config.upload.maxFileSize) {
    return res.status(400).json({
      success: false,
      error: 'File too large',
      message: `Maximum file size: ${config.upload.maxFileSize / (1024 * 1024)}MB`,
    });
  }

  next();
};

module.exports = validateImage;
