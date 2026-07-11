const asyncHandler = require('express-async-handler');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');

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

// @desc Create quiz for a course
// @route POST /api/quizzes/:courseId
const createQuiz = asyncHandler(async (req, res) => {
  const course = await ensureOwner(req.params.courseId, req.user);
  const { title, description, questions, timeLimit, passingScore } = req.body;

  const quiz = await Quiz.create({
    course: course._id,
    title,
    description,
    questions,
    timeLimit: timeLimit || 0,
    passingScore: passingScore || 50
  });

  // notify enrolled students
  const enrollments = await Enrollment.find({ course: course._id });
  const notifications = enrollments.map((e) => ({
    user: e.student,
    title: 'New Quiz Available',
    message: `A new quiz "${title}" is available in "${course.title}"`,
    type: 'quiz',
    link: `/quiz/${quiz._id}`
  }));
  if (notifications.length) await Notification.insertMany(notifications);

  res.status(201).json(quiz);
});

// @desc Get quizzes for a course
// @route GET /api/quizzes/:courseId
const getQuizzesForCourse = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({ course: req.params.courseId });
  res.json(quizzes);
});

// @desc Get quiz by id (hides correct answers for students)
// @route GET /api/quizzes/single/:id
const getQuizById = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  if (req.user.role === 'student') {
    const sanitized = quiz.toObject();
    sanitized.questions = sanitized.questions.map((q) => ({
      ...q,
      options: q.options.map((o) => ({ _id: o._id, text: o.text }))
    }));
    return res.json(sanitized);
  }

  res.json(quiz);
});

// @desc Update quiz
// @route PUT /api/quizzes/single/:id
const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }
  await ensureOwner(quiz.course, req.user);

  const fields = ['title', 'description', 'questions', 'timeLimit', 'passingScore'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) quiz[f] = req.body[f];
  });

  const updated = await quiz.save();
  res.json(updated);
});

// @desc Delete quiz
// @route DELETE /api/quizzes/single/:id
const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }
  await ensureOwner(quiz.course, req.user);
  await quiz.deleteOne();
  res.json({ message: 'Quiz removed' });
});

// @desc Attempt/submit a quiz
// @route POST /api/quizzes/single/:id/attempt
const attemptQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  const enrollment = await Enrollment.findOne({ student: req.user._id, course: quiz.course });
  if (!enrollment) {
    res.status(403);
    throw new Error('You must be enrolled to attempt this quiz');
  }

  const { answers } = req.body; // [{ question, selectedOptionIds: [] }]
  let correctCount = 0;
  let wrongCount = 0;
  let score = 0;
  let totalPoints = 0;

  const gradedAnswers = quiz.questions.map((q) => {
    totalPoints += q.points;
    const userAnswer = answers.find((a) => a.question === q._id.toString());
    const correctOptionIds = q.options.filter((o) => o.isCorrect).map((o) => o._id.toString());
    const selected = userAnswer ? userAnswer.selectedOptionIds.map(String) : [];

    const isCorrect =
      selected.length === correctOptionIds.length &&
      selected.every((id) => correctOptionIds.includes(id));

    if (isCorrect) {
      correctCount += 1;
      score += q.points;
    } else {
      wrongCount += 1;
    }

    return {
      question: q._id,
      selectedOptionIds: selected,
      isCorrect
    };
  });

  const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

  const attempt = await QuizAttempt.create({
    student: req.user._id,
    quiz: quiz._id,
    course: quiz.course,
    answers: gradedAnswers,
    score,
    percentage,
    correctCount,
    wrongCount
  });

  res.status(201).json(attempt);
});

// @desc Get my attempt history for a quiz
// @route GET /api/quizzes/single/:id/attempts
const getMyAttempts = asyncHandler(async (req, res) => {
  const attempts = await QuizAttempt.find({ quiz: req.params.id, student: req.user._id }).sort('-createdAt');
  res.json(attempts);
});

module.exports = {
  createQuiz, getQuizzesForCourse, getQuizById, updateQuiz, deleteQuiz, attemptQuiz, getMyAttempts
};
