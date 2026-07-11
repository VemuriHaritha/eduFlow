const express = require('express');
const router = express.Router();
const { studentDashboard, instructorDashboard, adminDashboard } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/student', protect, authorize('student'), studentDashboard);
router.get('/instructor', protect, authorize('instructor'), instructorDashboard);
router.get('/admin', protect, authorize('admin'), adminDashboard);

module.exports = router;
