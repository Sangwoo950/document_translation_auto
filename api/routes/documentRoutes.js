const express = require('express');
const router = express.Router();
const { getSingleDocument } = require('../controllers/documentController'); // 경로와 파일명이 올바른지 확인

router.get('/document', getSingleDocument);

module.exports = router;
