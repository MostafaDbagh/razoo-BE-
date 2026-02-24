/**
 * Contact routes - contact form submissions
 */
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const validateBody = require('../middlewares/validateBody');

const contactSchema = {
  name: { required: true, maxLength: 255 },
  email: { required: true, maxLength: 255, email: true },
  subject: { maxLength: 255 },
  message: { required: true, maxLength: 5000 },
};

router.post('/', validateBody(contactSchema), contactController.create);

module.exports = router;
