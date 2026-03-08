/**
 * Book controller - appointment booking (MongoDB)
 */
const orderService = require('../services/orderService');

/**
 * POST /api/book
 * Create a booking
 */
async function create(req, res, next) {
  try {
    const b = req.sanitizedBody;
    const order = await orderService.saveOrder({
      name: b.name,
      phone: b.phone,
      hairstyle: b.hairstyle,
      preferred_date: b.preferred_date,
      preferred_time: b.preferred_time,
      notes: b.notes,
    });

    res.status(201).json({
      success: true,
      data: {
        id: order.id,
        name: order.name,
        phone: order.phone,
        hairstyle: order.hairstyle,
        preferred_date: order.preferred_date,
        preferred_time: order.preferred_time,
        notes: order.notes,
        status: order.status,
        created_at: order.created_at,
      },
    });
  } catch (err) {
    const isDbError = err.message && (err.message.includes('MONGO_URI') || /connect|connection/i.test(err.message));
    if (isDbError) {
      return res.status(503).json({
        success: false,
        error: 'Booking service temporarily unavailable.',
        message: 'Please try again later. Ensure MONGO_URI is set.',
      });
    }
    next(err);
  }
}

module.exports = { create };
