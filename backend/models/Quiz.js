const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false }
}, { _id: true });

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  type: { type: String, enum: ['MCQ', 'TrueFalse', 'MultipleSelect'], default: 'MCQ' },
  options: [optionSchema],
  points: { type: Number, default: 1 }
});

const quizSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    questions: [questionSchema],
    timeLimit: { type: Number, default: 0 }, // minutes, 0 = unlimited
    passingScore: { type: Number, default: 50 } // percent
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
