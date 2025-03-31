const express = require('express');
const router = express.Router();
const { getSingleDocument } = require('../controllers/documentController');

router.get('/document', getSingleDocument);

module.exports = router;
// Compare this snippet from api/controllers/translationController.js:
