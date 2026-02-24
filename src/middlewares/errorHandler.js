/**
 * Centralized error handling middleware
 * Catches all errors and returns structured JSON responses
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error(`[ERROR] ${err.message}`);
  console.error(err.stack);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File too large',
      message: 'Upload size exceeds the maximum allowed limit (5MB)',
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: 'Unexpected field',
      message: 'Invalid form field name for file upload',
    });
  }

  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type',
      message: err.message,
    });
  }

  // Custom validation errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.name || 'ValidationError',
      message: err.message,
    });
  }

  // Default 500 error - send real message so user can see e.g. "AI service unavailable" or "Invalid response"
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  });
};

module.exports = errorHandler;
