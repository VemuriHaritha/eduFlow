const express = require('express');
const router = express.Router();
const {
  getAllUsers, toggleBlockUser, approveInstructor, deleteUser, adminDeleteCourse, getAllCoursesAdmin
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id/block', toggleBlockUser);
router.put('/users/:id/approve', approveInstructor);
router.delete('/users/:id', deleteUser);
router.get('/courses', getAllCoursesAdmin);
router.delete('/courses/:id', adminDeleteCourse);

module.exports = router;
