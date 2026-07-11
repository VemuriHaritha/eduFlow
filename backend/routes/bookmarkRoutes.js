const express = require('express');
const router = express.Router();
const { addBookmark, removeBookmark, getMyBookmarks } = require('../controllers/bookmarkController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('student'), getMyBookmarks);
router.post('/', protect, authorize('student'), addBookmark);
router.delete('/:lessonId', protect, authorize('student'), removeBookmark);

module.exports = router;
