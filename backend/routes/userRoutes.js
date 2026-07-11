const express = require('express');
const router = express.Router();
const { updateProfile, getUserProfile, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.put('/profile', protect, upload.single('photo'), updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/:id', getUserProfile);

module.exports = router;
