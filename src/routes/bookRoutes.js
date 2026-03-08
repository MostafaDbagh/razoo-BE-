/**
 * Book routes - haircut appointment booking
 */
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const validateBody = require('../middlewares/validateBody');

const bookSchema = {
  name: { required: true, maxLength: 255 },
  phone: { maxLength: 50 },
  hairstyle: { maxLength: 100 },
  preferred_date: { maxLength: 20 },
  preferred_time: { maxLength: 80 },
  notes: { maxLength: 1000 },
};

router.post('/', validateBody(bookSchema), bookController.create);

module.exports = router;
