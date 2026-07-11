const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc Update own profile
// @route PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const fields = ['name', 'bio', 'phone', 'skills', 'education', 'experience', 'specialization', 'qualifications', 'socialLinks'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) user[f] = req.body[f];
  });

  if (req.file) {
    user.photo = `/uploads/profiles/${req.file.filename}`;
  }

  const updated = await user.save();
  res.json(updated.toSafeObject());
});

// @desc Get public profile
// @route GET /api/users/:id
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user);
});

// @desc Change password
// @route PUT /api/users/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated successfully' });
});

module.exports = { updateProfile, getUserProfile, changePassword };
