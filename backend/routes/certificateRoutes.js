const express = require('express');
const router = express.Router();
const { generateCertificate, getCertificate, getMyCertificates } = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/auth');

router.get('/mine', protect, authorize('student'), getMyCertificates);
router.post('/:courseId', protect, authorize('student'), generateCertificate);
router.get('/:id', getCertificate);

module.exports = router;
