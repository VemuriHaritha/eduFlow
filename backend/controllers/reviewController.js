const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const recalcRating = async (courseId) => {
  const reviews = await Review.find({ course: courseId });
  const numReviews = reviews.length;
  const rating = numReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews : 0;
  await Course.findByIdAndUpdate(courseId, { rating: Math.round(rating * 10) / 10, numReviews });
};

// @desc Create review (only enrolled students)
// @route POST /api/reviews/:courseId
const createReview = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
  if (!enrollment) {
    res.status(403);
    throw new Error('You must be enrolled to review this course');
  }

  const existing = await Review.findOne({ course: req.params.courseId, student: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error('You already reviewed this course');
  }

  const { rating, comment } = req.body;
  const review = await Review.create({ course: req.params.courseId, student: req.user._id, rating, comment });
  await recalcRating(req.params.courseId);

  res.status(201).json(review);
});

// @desc Get reviews for a course
// @route GET /api/reviews/:courseId
const getReviewsForCourse = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ course: req.params.courseId }).populate('student', 'name photo').sort('-createdAt');
  res.json(reviews);
});

// @desc Instructor reply to review
// @route PUT /api/reviews/:id/reply
const replyToReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id).populate('course');
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  if (review.course.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  review.instructorReply = req.body.reply;
  await review.save();
  res.json(review);
});

// @desc Delete review
// @route DELETE /api/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  if (review.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }
  const courseId = review.course;
  await review.deleteOne();
  await recalcRating(courseId);
  res.json({ message: 'Review removed' });
});

module.exports = { createReview, getReviewsForCourse, replyToReview, deleteReview };
