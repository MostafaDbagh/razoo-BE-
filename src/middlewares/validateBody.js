/**
 * Request body validation middleware
 * Validates required and optional string fields, sanitizes input
 */
function validateBody(schema) {
  return (req, res, next) => {
    const body = req.body || {};
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];
      const trimmed = typeof value === 'string' ? value.trim() : value;

      if (rules.required && (trimmed === undefined || trimmed === '')) {
        errors.push(`${field} is required`);
      } else if (trimmed !== undefined && trimmed !== '') {
        if (rules.maxLength && String(trimmed).length > rules.maxLength) {
          errors.push(`${field} must be at most ${rules.maxLength} characters`);
        }
        if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
          errors.push(`${field} must be a valid email`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: errors.join('; '),
      });
    }

    // Attach sanitized body
    req.sanitizedBody = {};
    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];
      if (value !== undefined) {
        req.sanitizedBody[field] = typeof value === 'string' ? value.trim() : value;
      }
    }
    next();
  };
}

module.exports = validateBody;
