const asyncHandler = require('express-async-handler');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
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

// @desc Create assignment
// @route POST /api/assignments/:courseId
const createAssignment = asyncHandler(async (req, res) => {
  const course = await ensureOwner(req.params.courseId, req.user);
  const { title, description, dueDate, maxMarks } = req.body;

  const assignment = await Assignment.create({
    course: course._id,
    title,
    description,
    dueDate,
    maxMarks: maxMarks || 100
  });

  const enrollments = await Enrollment.find({ course: course._id });
  const notifications = enrollments.map((e) => ({
    user: e.student,
    title: 'New Assignment Posted',
    message: `"${title}" has been posted in "${course.title}". Due: ${new Date(dueDate).toDateString()}`,
    type: 'assignment',
    link: `/assignment/${assignment._id}`
  }));
  if (notifications.length) await Notification.insertMany(notifications);

  res.status(201).json(assignment);
});

// @desc Get assignments for course
// @route GET /api/assignments/:courseId
const getAssignmentsForCourse = asyncHandler(async (req, res) => {
  const assignments = await Assignment.find({ course: req.params.courseId }).sort('-createdAt');
  res.json(assignments);
});

// @desc Get single assignment
// @route GET /api/assignments/single/:id
const getAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }
  res.json(assignment);
});

// @desc Update assignment
// @route PUT /api/assignments/single/:id
const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }
  await ensureOwner(assignment.course, req.user);

  const fields = ['title', 'description', 'dueDate', 'maxMarks'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) assignment[f] = req.body[f];
  });

  const updated = await assignment.save();
  res.json(updated);
});

// @desc Delete assignment
// @route DELETE /api/assignments/single/:id
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }
  await ensureOwner(assignment.course, req.user);
  await assignment.deleteOne();
  res.json({ message: 'Assignment removed' });
});

// @desc Submit assignment
// @route POST /api/assignments/single/:id/submit
const submitAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a file');
  }

  const enrollment = await Enrollment.findOne({ student: req.user._id, course: assignment.course });
  if (!enrollment) {
    res.status(403);
    throw new Error('You must be enrolled to submit');
  }

  const existing = await Submission.findOne({ assignment: assignment._id, student: req.user._id });
  const fileUrl = `/uploads/assignments/${req.file.filename}`;

  let submission;
  if (existing) {
    existing.fileUrl = fileUrl;
    existing.fileName = req.file.originalname;
    existing.submittedAt = new Date();
    existing.isGraded = false;
    existing.marks = null;
    submission = await existing.save();
  } else {
    submission = await Submission.create({
      assignment: assignment._id,
      student: req.user._id,
      fileUrl,
      fileName: req.file.originalname
    });
  }

  res.status(201).json(submission);
});

// @desc Get submissions for an assignment (instructor view)
// @route GET /api/assignments/single/:id/submissions
const getSubmissions = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }
  await ensureOwner(assignment.course, req.user);

  const submissions = await Submission.find({ assignment: assignment._id }).populate('student', 'name email photo');
  res.json(submissions);
});

// @desc Get my submission for an assignment
// @route GET /api/assignments/single/:id/my-submission
const getMySubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findOne({ assignment: req.params.id, student: req.user._id });
  res.json(submission || null);
});

// @desc Grade a submission
// @route PUT /api/assignments/submissions/:submissionId/grade
const gradeSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.submissionId).populate('assignment');
  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }
  await ensureOwner(submission.assignment.course, req.user);

  const { marks, remarks } = req.body;
  submission.marks = marks;
  submission.remarks = remarks || '';
  submission.isGraded = true;
  await submission.save();

  await Notification.create({
    user: submission.student,
    title: 'Assignment Graded',
    message: `Your submission for "${submission.assignment.title}" has been graded: ${marks}/${submission.assignment.maxMarks}`,
    type: 'grade',
    link: `/assignment/${submission.assignment._id}`
  });

  res.json(submission);
});

module.exports = {
  createAssignment, getAssignmentsForCourse, getAssignmentById, updateAssignment, deleteAssignment,
  submitAssignment, getSubmissions, getMySubmission, gradeSubmission
};
