const asyncHandler = require('express-async-handler');
const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc Generate certificate when course is 100% complete
// @route POST /api/certificates/:courseId
const generateCertificate = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
  if (!enrollment || !enrollment.isCompleted) {
    res.status(400);
    throw new Error('Course must be 100% completed to generate a certificate');
  }

  let certificate = await Certificate.findOne({ student: req.user._id, course: req.params.courseId });
  if (!certificate) {
    certificate = await Certificate.create({
      student: req.user._id,
      course: req.params.courseId,
      completionDate: enrollment.completedAt || new Date()
    });
  }

  res.status(201).json(certificate);
});

// @desc Get certificate details
// @route GET /api/certificates/:id
const getCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id)
    .populate('student', 'name')
    .populate({ path: 'course', populate: { path: 'instructor', select: 'name' } });
  if (!certificate) {
    res.status(404);
    throw new Error('Certificate not found');
  }
  res.json(certificate);
});

// @desc Get my certificates
// @route GET /api/certificates/mine
const getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({ student: req.user._id }).populate('course', 'title thumbnail');
  res.json(certificates);
});

module.exports = { generateCertificate, getCertificate, getMyCertificates };
