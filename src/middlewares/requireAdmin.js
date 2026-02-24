/**
 * Require valid admin token (Bearer) for protected routes
 */
const config = require('../config');

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  const token = auth && auth.startsWith('Bearer ') ? auth.slice(7).trim() : null;
  if (!token || token !== config.admin.secret) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Valid admin token required.',
    });
  }
  next();
}

module.exports = requireAdmin;
