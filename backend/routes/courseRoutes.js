const express = require('express');
const router = express.Router();
const {
  createCourse, getCourses, getCourseById, updateCourse, deleteCourse,
  togglePublish, getMyCourses, getEnrolledStudents
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getCourses);
router.get('/instructor/mine', protect, authorize('instructor', 'admin'), getMyCourses);
router.get('/:id', getCourseById);
router.get('/:id/students', protect, authorize('instructor', 'admin'), getEnrolledStudents);
router.post('/', protect, authorize('instructor', 'admin'), upload.single('thumbnail'), createCourse);
router.put('/:id', protect, authorize('instructor', 'admin'), upload.single('thumbnail'), updateCourse);
router.put('/:id/publish', protect, authorize('instructor', 'admin'), togglePublish);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);

module.exports = router;
