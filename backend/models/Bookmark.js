const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }
  },
  { timestamps: true }
);

bookmarkSchema.index({ student: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
