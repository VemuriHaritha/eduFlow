const express = require('express');
const router = express.Router();
const { addToWishlist, removeFromWishlist, getMyWishlist } = require('../controllers/wishlistController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('student'), getMyWishlist);
router.post('/', protect, authorize('student'), addToWishlist);
router.delete('/:courseId', protect, authorize('student'), removeFromWishlist);

module.exports = router;
