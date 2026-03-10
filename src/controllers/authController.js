const jwt = require('jsonwebtoken');
const config = require('../config');
const adminService = require('../services/adminService');

async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  const admin = await adminService.verifyAdmin(email, password);
  if (!admin) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { sub: admin.email, role: 'admin' },
    config.admin.jwtSecret,
    { expiresIn: '7d' }
  );

  res.json({ success: true, token });
}

module.exports = { login };
