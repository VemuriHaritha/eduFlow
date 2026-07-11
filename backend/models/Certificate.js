const mongoose = require('mongoose');
const crypto = require('crypto');

const certificateSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    certificateId: { type: String, unique: true },
    completionDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

certificateSchema.pre('validate', function (next) {
  if (!this.certificateId) {
    this.certificateId = 'CERT-' + crypto.randomBytes(6).toString('hex').toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
