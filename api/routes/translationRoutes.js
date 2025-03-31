const express = require('express');
const router = express.Router();
const translateController = require('../controllers/translateController');

router.get('/preview', translateController.previewTranslation);
router.post('/confirm', translateController.confirmTranslation);

module.exports = router;
