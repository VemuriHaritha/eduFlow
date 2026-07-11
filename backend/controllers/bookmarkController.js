const asyncHandler = require('express-async-handler');
const Bookmark = require('../models/Bookmark');

const addBookmark = asyncHandler(async (req, res) => {
  const { lessonId, courseId } = req.body;
  const existing = await Bookmark.findOne({ student: req.user._id, lesson: lessonId });
  if (existing) {
    res.status(400);
    throw new Error('Lesson already bookmarked');
  }
  const bookmark = await Bookmark.create({ student: req.user._id, lesson: lessonId, course: courseId });
  res.status(201).json(bookmark);
});

const removeBookmark = asyncHandler(async (req, res) => {
  const bookmark = await Bookmark.findOne({ student: req.user._id, lesson: req.params.lessonId });
  if (!bookmark) {
    res.status(404);
    throw new Error('Bookmark not found');
  }
  await bookmark.deleteOne();
  res.json({ message: 'Bookmark removed' });
});

const getMyBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await Bookmark.find({ student: req.user._id })
    .populate('lesson', 'title duration')
    .populate('course', 'title thumbnail');
  res.json(bookmarks);
});

module.exports = { addBookmark, removeBookmark, getMyBookmarks };
