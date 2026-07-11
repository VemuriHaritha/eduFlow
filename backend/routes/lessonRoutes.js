const express = require('express');
const router = express.Router();
const {
  createLesson, getLessons, getLessonById, updateLesson, deleteLesson, markLessonComplete
} = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const lessonUpload = upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'pdfNotes', maxCount: 1 },
  { name: 'attachments', maxCount: 5 }
]);

router.get('/:courseId', getLessons);
router.post('/:courseId', protect, authorize('instructor', 'admin'), lessonUpload, createLesson);
router.get('/single/:id', getLessonById);
router.put('/single/:id', protect, authorize('instructor', 'admin'), lessonUpload, updateLesson);
router.delete('/single/:id', protect, authorize('instructor', 'admin'), deleteLesson);
router.post('/single/:id/complete', protect, authorize('student'), markLessonComplete);

module.exports = router;
