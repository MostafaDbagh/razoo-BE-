/**
 * Book controller - haircut appointment booking (saved to MongoDB as order)
 */
const orderService = require('../services/orderService');

/**
 * POST /api/book
 * Create a booking request (stored as order in MongoDB for admin to browse)
 */
async function create(req, res, next) {
  try {
    const b = req.sanitizedBody;
    const order = await orderService.createOrder({
      name: b.name,
      email: b.email,
      phone: b.phone,
      hairstyle: b.hairstyle,
      preferredDate: b.preferred_date,
      preferredTime: b.preferred_time,
      notes: b.notes,
    });

    res.status(201).json({
      success: true,
      data: {
        id: order.id,
        name: order.name,
        email: order.email,
        phone: order.phone,
        hairstyle: order.hairstyle,
        preferred_date: order.preferred_date,
        preferred_time: order.preferred_time,
        notes: order.notes,
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
