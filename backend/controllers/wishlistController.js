const asyncHandler = require('express-async-handler');
const Wishlist = require('../models/Wishlist');

const addToWishlist = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const existing = await Wishlist.findOne({ student: req.user._id, course: courseId });
  if (existing) {
    res.status(400);
    throw new Error('Course already in wishlist');
  }
  const item = await Wishlist.create({ student: req.user._id, course: courseId });
  res.status(201).json(item);
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const item = await Wishlist.findOne({ student: req.user._id, course: req.params.courseId });
  if (!item) {
    res.status(404);
    throw new Error('Item not found in wishlist');
  }
  await item.deleteOne();
  res.json({ message: 'Removed from wishlist' });
});

const getMyWishlist = asyncHandler(async (req, res) => {
  const items = await Wishlist.find({ student: req.user._id }).populate({
    path: 'course',
    populate: [{ path: 'category', select: 'name' }, { path: 'instructor', select: 'name' }]
  });
  res.json(items);
});

module.exports = { addToWishlist, removeFromWishlist, getMyWishlist };
