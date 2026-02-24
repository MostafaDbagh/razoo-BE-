const express = require('express');
const router = express.Router();
const tryonController = require('../controllers/tryonController');
const upload = require('../middlewares/upload');
const validateImage = require('../middlewares/validateImage');

router.get('/status', tryonController.status);
router.post('/', upload.single('image'), validateImage, tryonController.generate);

module.exports = router;
