/**
 * Admin routes - orders + contacts (all require admin token)
 */
const express = require('express');
const router = express.Router();
const requireAdmin = require('../middlewares/requireAdmin');
const adminOrdersController = require('../controllers/adminOrdersController');
const adminContactsController = require('../controllers/adminContactsController');

router.use(requireAdmin);

router.get('/orders', adminOrdersController.list);
router.patch('/orders/:id', adminOrdersController.updateStatus);
router.delete('/orders/:id', adminOrdersController.remove);

router.get('/contacts', adminContactsController.list);

module.exports = router;
