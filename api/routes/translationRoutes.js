const express = require('express');
const router = express.Router();
const translateController = require('../controllers/translateController');

router.get('/translate/preview', translateController.previewTranslation);
router.post('/translate/confirm', translateController.confirmTranslation);

module.exports = router;
