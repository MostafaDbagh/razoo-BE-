const jwt = require('jsonwebtoken');
const config = require('../config');

function login(req, res) {
  const { email, password } = req.body || {};
  const adminEmail = config.admin.email;
  const adminPassword = config.admin.password;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  if (String(email).trim() !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { sub: adminEmail, role: 'admin' },
    config.admin.jwtSecret,
    { expiresIn: '7d' }
  );

  res.json({ success: true, token });
}

module.exports = { login };
