const asyncHandler = require('express-async-handler');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Notification = require('../models/Notification');

// @desc Enroll in a course
// @route POST /api/enrollments/:courseId
const enrollInCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const existing = await Enrollment.findOne({ student: req.user._id, course: course._id });
  if (existing) {
    res.status(400);
    throw new Error('Already enrolled in this course');
  }

  const enrollment = await Enrollment.create({ student: req.user._id, course: course._id });

  course.enrolledCount += 1;
  await course.save();

  await Notification.create({
    user: req.user._id,
    title: 'Enrollment Successful',
    message: `You have enrolled in "${course.title}"`,
    type: 'course',
    link: `/courses/${course._id}`
  });

  res.status(201).json(enrollment);
});

// @desc Get my enrolled courses
// @route GET /api/enrollments/mine
const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate({
      path: 'course',
      populate: [{ path: 'category', select: 'name' }, { path: 'instructor', select: 'name' }]
    })
    .sort('-createdAt');
  res.json(enrollments);
});

// @desc Get enrollment status/progress for a specific course
// @route GET /api/enrollments/:courseId/status
const getEnrollmentStatus = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
  res.json(enrollment || null);
});

module.exports = { enrollInCourse, getMyEnrollments, getEnrollmentStatus };
