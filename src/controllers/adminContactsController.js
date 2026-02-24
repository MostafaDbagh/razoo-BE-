/**
 * Admin contacts controller - list all contact form submissions
 */
const orderService = require('../services/orderService');

async function list(req, res, next) {
  try {
    const contacts = await orderService.getAllContacts();
    res.json({ success: true, data: contacts });
  } catch (err) {
    if (err.message && (err.message.includes('MONGO_URI') || /connect|connection/i.test(err.message))) {
      return res.status(503).json({
        success: false,
        error: 'Contacts service unavailable',
        message: 'MongoDB is not configured.',
      });
    }
    next(err);
  }
}

module.exports = { list };
