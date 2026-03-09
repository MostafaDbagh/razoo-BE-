const jwt = require('jsonwebtoken');
const config = require('../config');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token required' });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, config.admin.jwtSecret);
    if (payload.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth };
