const express = require('express');
const router = express.Router();
const {
  createQuiz, getQuizzesForCourse, getQuizById, updateQuiz, deleteQuiz, attemptQuiz, getMyAttempts
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/auth');

router.get('/:courseId', getQuizzesForCourse);
router.post('/:courseId', protect, authorize('instructor', 'admin'), createQuiz);
router.get('/single/:id', protect, getQuizById);
router.put('/single/:id', protect, authorize('instructor', 'admin'), updateQuiz);
router.delete('/single/:id', protect, authorize('instructor', 'admin'), deleteQuiz);
router.post('/single/:id/attempt', protect, authorize('student'), attemptQuiz);
router.get('/single/:id/attempts', protect, authorize('student'), getMyAttempts);

module.exports = router;
