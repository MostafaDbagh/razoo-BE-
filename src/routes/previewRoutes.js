const express = require('express');
const router = express.Router();
const previewController = require('../controllers/previewController');

router.get('/:style', previewController.hairstylePreview);

module.exports = router;
