const express = require('express');
const router = express.Router();
const { enrollInCourse, getMyEnrollments, getEnrollmentStatus } = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/:courseId', protect, authorize('student'), enrollInCourse);
router.get('/mine', protect, authorize('student'), getMyEnrollments);
router.get('/:courseId/status', protect, getEnrollmentStatus);

module.exports = router;
