const express = require('express');
const router = express.Router();
const {
  createAssignment, getAssignmentsForCourse, getAssignmentById, updateAssignment, deleteAssignment,
  submitAssignment, getSubmissions, getMySubmission, gradeSubmission
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/:courseId', getAssignmentsForCourse);
router.post('/:courseId', protect, authorize('instructor', 'admin'), createAssignment);
router.get('/single/:id', protect, getAssignmentById);
router.put('/single/:id', protect, authorize('instructor', 'admin'), updateAssignment);
router.delete('/single/:id', protect, authorize('instructor', 'admin'), deleteAssignment);
router.post('/single/:id/submit', protect, authorize('student'), upload.single('submission'), submitAssignment);
router.get('/single/:id/submissions', protect, authorize('instructor', 'admin'), getSubmissions);
router.get('/single/:id/my-submission', protect, authorize('student'), getMySubmission);
router.put('/submissions/:submissionId/grade', protect, authorize('instructor', 'admin'), gradeSubmission);

module.exports = router;
