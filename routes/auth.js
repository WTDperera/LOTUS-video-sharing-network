const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const imageUpload = require('../middleware/imageUpload');

// Authentication Routes - Presentation Layer

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authController.login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, authController.getMe);

// @route   PUT /api/auth/update
// @desc    Update user profile
// @access  Private
router.put('/update', protect, authController.updateProfile);

// @route   POST /api/auth/upload-avatar
// @desc    Upload user avatar/profile picture
// @access  Private
router.post('/upload-avatar', protect, imageUpload.single('avatar'), authController.uploadAvatar);

module.exports = router;
