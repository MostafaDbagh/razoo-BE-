/**
 * Admin orders controller - list, update status, delete (when complete)
 */
const orderService = require('../services/orderService');

async function list(req, res, next) {
  try {
    const orders = await orderService.getAllOrders();
    res.json({ success: true, data: orders });
  } catch (err) {
    if (err.message && err.message.includes('MONGO_URI')) {
      return res.status(503).json({
        success: false,
        error: 'Orders service unavailable',
        message: 'MongoDB is not configured.',
      });
    }
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!status || typeof status !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Body must include "status" (pending, confirmed, in_progress, complete).',
      });
    }
    const order = await orderService.updateOrderStatus(id, status.trim().toLowerCase());
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    if (err.message && err.message.includes('Invalid status')) {
      return res.status(400).json({ success: false, error: err.message });
    }
    if (err.message && err.message.includes('MONGO_URI')) {
      return res.status(503).json({
        success: false,
        error: 'Orders service unavailable',
      });
    }
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const result = await orderService.deleteOrderIfComplete(id);
    if (result.deleted) {
      return res.json({ success: true, message: 'Order deleted' });
    }
    if (result.error === 'Order not found') {
      return res.status(404).json({ success: false, error: result.error });
    }
    return res.status(400).json({
      success: false,
      error: result.error || 'Delete failed',
    });
  } catch (err) {
    if (err.message && err.message.includes('MONGO_URI')) {
      return res.status(503).json({
        success: false,
        error: 'Orders service unavailable',
      });
    }
    next(err);
  }
}

module.exports = { list, updateStatus, remove };
