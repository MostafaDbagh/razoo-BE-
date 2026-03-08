/**
 * Contact controller - contact form submissions (MongoDB)
 */
const orderService = require('../services/orderService');

/**
 * POST /api/contact
 * Submit a contact message
 */
async function create(req, res, next) {
  try {
    const b = req.sanitizedBody;
    const contact = await orderService.saveContact({
      name: b.name,
      phone: b.phone,
      subject: b.subject,
      message: b.message,
    });

    res.status(201).json({
      success: true,
      data: {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        subject: contact.subject,
        message: contact.message,
        created_at: contact.created_at,
      },
    });
  } catch (err) {
    const isDbError = err.message && (err.message.includes('MONGO_URI') || /connect|connection/i.test(err.message));
    if (isDbError) {
      return res.status(503).json({
        success: false,
        error: 'Contact service temporarily unavailable.',
        message: 'Please try again later. Ensure MONGO_URI is set.',
      });
    }
    next(err);
  }
}

module.exports = { create };
