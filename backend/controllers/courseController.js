const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Review = require('../models/Review');

// @desc Create course
// @route POST /api/courses
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, category, difficulty, duration, price, language, tags } = req.body;

  const course = await Course.create({
    title,
    description,
    category,
    difficulty,
    duration,
    price: price || 0,
    language,
    tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t) => t.trim()) : []),
    instructor: req.user._id,
    thumbnail: req.file ? `/uploads/thumbnails/${req.file.filename}` : ''
  });

  res.status(201).json(course);
});

// @desc Get all courses with search/filter/sort/pagination
// @route GET /api/courses
const getCourses = asyncHandler(async (req, res) => {
  const {
    search, category, difficulty, language, minPrice, maxPrice, free,
    sort, page = 1, limit = 12, instructor, publishedOnly
  } = req.query;

  const query = {};

  if (publishedOnly !== 'false') query.isPublished = true;
  if (search) query.$text = { $search: search };
  if (category) query.category = category;
  if (difficulty) query.difficulty = difficulty;
  if (language) query.language = language;
  if (instructor) query.instructor = instructor;
  if (free === 'true') query.price = 0;
  if (minPrice || maxPrice) {
    query.price = query.price || {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'oldest') sortOption = { createdAt: 1 };
  else if (sort === 'rating') sortOption = { rating: -1 };
  else if (sort === 'popular') sortOption = { enrolledCount: -1 };
  else if (sort === 'alphabetical') sortOption = { title: 1 };

  const skip = (Number(page) - 1) * Number(limit);

  const [courses, total] = await Promise.all([
    Course.find(query)
      .populate('category', 'name')
      .populate('instructor', 'name photo')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit)),
    Course.countDocuments(query)
  ]);

  res.json({
    courses,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit))
  });
});

// @desc Get single course details
// @route GET /api/courses/:id
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('category', 'name')
    .populate('instructor', 'name photo bio experience specialization');

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const lessons = await Lesson.find({ course: course._id }).sort('order');
  const reviews = await Review.find({ course: course._id }).populate('student', 'name photo').sort('-createdAt');

  res.json({ course, lessons, reviews });
});

// @desc Update course
// @route PUT /api/courses/:id
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to edit this course');
  }

  const fields = ['title', 'description', 'category', 'difficulty', 'duration', 'price', 'language'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) course[f] = req.body[f];
  });
  if (req.body.tags) {
    course.tags = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map((t) => t.trim());
  }
  if (req.file) course.thumbnail = `/uploads/thumbnails/${req.file.filename}`;

  const updated = await course.save();
  res.json(updated);
});

// @desc Delete course
// @route DELETE /api/courses/:id
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this course');
  }
  await course.deleteOne();
  await Lesson.deleteMany({ course: course._id });
  res.json({ message: 'Course removed' });
});

// @desc Publish/Unpublish course
// @route PUT /api/courses/:id/publish
const togglePublish = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }
  course.isPublished = !course.isPublished;
  course.isDraft = !course.isPublished;
  await course.save();
  res.json(course);
});

// @desc Get instructor's own courses
// @route GET /api/courses/instructor/mine
const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).populate('category', 'name').sort('-createdAt');
  res.json(courses);
});

// @desc Get enrolled students for a course
// @route GET /api/courses/:id/students
const getEnrolledStudents = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }
  const enrollments = await Enrollment.find({ course: course._id }).populate('student', 'name email photo');
  res.json(enrollments);
});

module.exports = {
  createCourse, getCourses, getCourseById, updateCourse, deleteCourse,
  togglePublish, getMyCourses, getEnrolledStudents
};
