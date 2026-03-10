const express = require('express');
const { requireAuth } = require('../middlewares/requireAuth');
const orderService = require('../services/orderService');

const router = express.Router();
router.use(requireAuth);

router.get('/orders', async (req, res) => {
  try {
    const data = await orderService.getOrders();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to load orders' });
  }
});

router.get('/contacts', async (req, res) => {
  try {
    const data = await orderService.getContacts();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to load contacts' });
  }
});

router.patch('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    const valid = ['pending', 'confirmed', 'in_progress', 'complete'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const data = await orderService.updateOrderStatus(id, status);
    if (!data) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Update failed' });
  }
});

router.delete('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await orderService.deleteOrder(id);
    if (!ok) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Delete failed' });
  }
});

router.delete('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await orderService.deleteContact(id);
    if (!ok) return res.status(404).json({ success: false, message: 'Contact not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Delete failed' });
  }
});

module.exports = router;
