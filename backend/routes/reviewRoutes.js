const express = require('express');
const router = express.Router();
const { createReview, getReviewsForCourse, replyToReview, deleteReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.get('/:courseId', getReviewsForCourse);
router.post('/:courseId', protect, authorize('student'), createReview);
router.put('/:id/reply', protect, authorize('instructor'), replyToReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
