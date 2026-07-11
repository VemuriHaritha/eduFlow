const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Course = require('../models/Course');
const Category = require('../models/Category');

// @desc Get all users
// @route GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } }
  ];
  const users = await User.find(query).select('-password').sort('-createdAt');
  res.json(users);
});

// @desc Block/unblock a user
// @route PUT /api/admin/users/:id/block
const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot block an admin');
  }
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json(user.toSafeObject());
});

// @desc Approve instructor account
// @route PUT /api/admin/users/:id/approve
const approveInstructor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isApproved = true;
  await user.save();
  res.json(user.toSafeObject());
});

// @desc Delete a user
// @route DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  await user.deleteOne();
  res.json({ message: 'User removed' });
});

// @desc Delete inappropriate course
// @route DELETE /api/admin/courses/:id
const adminDeleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  await course.deleteOne();
  res.json({ message: 'Course removed by admin' });
});

// @desc Get all courses (admin view, including unpublished)
// @route GET /api/admin/courses
const getAllCoursesAdmin = asyncHandler(async (req, res) => {
  const courses = await Course.find().populate('category', 'name').populate('instructor', 'name email').sort('-createdAt');
  res.json(courses);
});

module.exports = {
  getAllUsers, toggleBlockUser, approveInstructor, deleteUser, adminDeleteCourse, getAllCoursesAdmin
};
