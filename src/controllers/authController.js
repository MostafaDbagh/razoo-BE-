/**
 * Auth controller - admin login
 */
const config = require('../config');

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns { success, token } on success; 401 on invalid credentials
 */
async function login(req, res) {
  const { email, password } = req.body || {};
  const emailTrim = (email && String(email).trim().toLowerCase()) || '';
  const passwordVal = password != null ? String(password) : '';

  if (!emailTrim || !passwordVal) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: 'Email and password are required.',
    });
  }

  const match =
    emailTrim === config.admin.email.trim().toLowerCase() &&
    passwordVal === config.admin.password;

  if (!match) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
      message: 'Email or password is incorrect.',
    });
  }

  res.json({
    success: true,
    token: config.admin.secret,
    message: 'Login successful.',
  });
}

module.exports = { login };
