const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const QuizAttempt = require('../models/QuizAttempt');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Category = require('../models/Category');

// @desc Student dashboard summary
// @route GET /api/analytics/student
const studentDashboard = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id }).populate('course', 'title thumbnail');
  const completed = enrollments.filter((e) => e.isCompleted).length;

  const attempts = await QuizAttempt.find({ student: req.user._id });
  const avgScore = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length)
    : 0;

  const submissions = await Submission.find({ student: req.user._id });
  const courseIds = enrollments.map((e) => e.course?._id).filter(Boolean);
  const assignments = await Assignment.find({ course: { $in: courseIds } });
  const submittedAssignmentIds = submissions.map((s) => s.assignment.toString());
  const pendingAssignments = assignments.filter((a) => !submittedAssignmentIds.includes(a._id.toString()) && new Date(a.dueDate) > new Date());

  res.json({
    enrolledCourses: enrollments.length,
    completedCourses: completed,
    pendingAssignments: pendingAssignments.length,
    upcomingQuizzes: 0, // computed client-side per course if needed
    averageScore: avgScore,
    progressData: enrollments.map((e) => ({ course: e.course?.title, progress: e.progressPercent }))
  });
});

// @desc Instructor dashboard summary
// @route GET /api/analytics/instructor
const instructorDashboard = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id });
  const courseIds = courses.map((c) => c._id);

  const enrollments = await Enrollment.find({ course: { $in: courseIds } });
  const submissions = await Submission.find().populate({
    path: 'assignment',
    match: { course: { $in: courseIds } }
  });
  const validSubmissions = submissions.filter((s) => s.assignment);

  const totalRating = courses.reduce((s, c) => s + c.rating, 0);
  const avgRating = courses.length ? Math.round((totalRating / courses.length) * 10) / 10 : 0;

  const studentsPerCourse = await Promise.all(
    courses.map(async (c) => ({
      course: c.title,
      students: await Enrollment.countDocuments({ course: c._id })
    }))
  );

  res.json({
    totalCourses: courses.length,
    totalStudents: enrollments.length,
    assignmentsSubmitted: validSubmissions.length,
    revenue: courses.reduce((sum, c) => sum + c.price * c.enrolledCount, 0),
    averageRating: avgRating,
    studentsPerCourse
  });
});

// @desc Admin dashboard summary
// @route GET /api/analytics/admin
const adminDashboard = asyncHandler(async (req, res) => {
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalInstructors = await User.countDocuments({ role: 'instructor' });
  const totalCourses = await Course.countDocuments();
  const activeUsers = await User.countDocuments({ isBlocked: false });

  const categories = await Category.find();
  const categoryDistribution = await Promise.all(
    categories.map(async (cat) => ({
      category: cat.name,
      count: await Course.countDocuments({ category: cat._id })
    }))
  );

  const coursesByPopularity = await Course.find().sort('-enrolledCount').limit(5).select('title enrolledCount');

  res.json({
    totalStudents,
    totalInstructors,
    totalCourses,
    activeUsers,
    categoryDistribution,
    coursesByPopularity
  });
});

module.exports = { studentDashboard, instructorDashboard, adminDashboard };
