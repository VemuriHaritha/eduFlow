const asyncHandler = require('express-async-handler');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const ensureOwner = async (courseId, user) => {
  const course = await Course.findById(courseId);
  if (!course) {
    const err = new Error('Course not found');
    err.statusCode = 404;
    throw err;
  }
  if (course.instructor.toString() !== user._id.toString() && user.role !== 'admin') {
    const err = new Error('Not authorized');
    err.statusCode = 403;
    throw err;
  }
  return course;
};

// @desc Add lesson to course
// @route POST /api/lessons/:courseId
const createLesson = asyncHandler(async (req, res) => {
  await ensureOwner(req.params.courseId, req.user);

  const { title, description, videoUrl, duration, order } = req.body;
  const files = req.files || {};

  const lesson = await Lesson.create({
    course: req.params.courseId,
    title,
    description,
    videoUrl: files.video ? `/uploads/lessons/${files.video[0].filename}` : (videoUrl || ''),
    pdfNotes: files.pdfNotes ? `/uploads/lessons/${files.pdfNotes[0].filename}` : '',
    attachments: files.attachments ? files.attachments.map((f) => `/uploads/lessons/${f.filename}`) : [],
    duration: duration || 0,
    order: order || 0
  });

  res.status(201).json(lesson);
});

// @desc Get lessons for a course
// @route GET /api/lessons/:courseId
const getLessons = asyncHandler(async (req, res) => {
  const lessons = await Lesson.find({ course: req.params.courseId }).sort('order');
  res.json(lessons);
});

// @desc Get single lesson
// @route GET /api/lessons/single/:id
const getLessonById = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }
  res.json(lesson);
});

// @desc Update lesson
// @route PUT /api/lessons/single/:id
const updateLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }
  await ensureOwner(lesson.course, req.user);

  const fields = ['title', 'description', 'videoUrl', 'duration', 'order'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) lesson[f] = req.body[f];
  });

  const files = req.files || {};
  if (files.video) lesson.videoUrl = `/uploads/lessons/${files.video[0].filename}`;
  if (files.pdfNotes) lesson.pdfNotes = `/uploads/lessons/${files.pdfNotes[0].filename}`;

  const updated = await lesson.save();
  res.json(updated);
});

// @desc Delete lesson
// @route DELETE /api/lessons/single/:id
const deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }
  await ensureOwner(lesson.course, req.user);
  await lesson.deleteOne();
  res.json({ message: 'Lesson removed' });
});

// @desc Mark lesson as completed
// @route POST /api/lessons/single/:id/complete
const markLessonComplete = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  const enrollment = await Enrollment.findOne({ student: req.user._id, course: lesson.course });
  if (!enrollment) {
    res.status(403);
    throw new Error('You are not enrolled in this course');
  }

  if (!enrollment.completedLessons.includes(lesson._id)) {
    enrollment.completedLessons.push(lesson._id);
  }

  const totalLessons = await Lesson.countDocuments({ course: lesson.course });
  enrollment.progressPercent = totalLessons > 0
    ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
    : 0;

  if (enrollment.progressPercent >= 100) {
    enrollment.isCompleted = true;
    enrollment.completedAt = new Date();
  }

  await enrollment.save();
  res.json(enrollment);
});

module.exports = { createLesson, getLessons, getLessonById, updateLesson, deleteLesson, markLessonComplete };
