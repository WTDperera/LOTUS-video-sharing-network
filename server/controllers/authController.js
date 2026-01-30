const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const DEFAULT_TOKEN_EXPIRY = '7d';

/**
 * Generate JWT authentication token
 * @param {string} userId - MongoDB user ID
 * @returns {string} Signed JWT token
 */
const generateAuthToken = (userId) => {
  const tokenExpiry = process.env.JWT_EXPIRE || DEFAULT_TOKEN_EXPIRY;
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: tokenExpiry,
  });
};

/**
 * Format user data for API response (excludes password)
 * @param {Object} userDocument - Mongoose user document
 * @returns {Object} Sanitized user object
 */
const formatUserResponse = (userDocument) => ({
  id: userDocument._id,
  name: userDocument.name,
  email: userDocument.email,
  avatar: userDocument.avatar,
  role: userDocument.role,
});

/**
 * Validation rules for user registration
 */
const registrationValidationRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = [
  ...registrationValidationRules,

  async (req, res) => {
    try {
      // Guard: Check validation errors
      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        console.log('Validation errors:', validationErrors.array());
        return res.status(400).json({
          success: false,
          errors: validationErrors.array(),
        });
      }

      const { name, email, password } = req.body;
      console.log('Registration attempt for:', email);

      // Guard: Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('User already exists:', email);
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email',
        });
      }

      // Create new user (password hashing handled by User model pre-save hook)
      const newUser = await User.create({
        name,
        email,
        password,
      });

      console.log('User created successfully:', newUser._id);
      const authToken = generateAuthToken(newUser._id);

      return res.status(201).json({
        success: true,
        token: authToken,
        user: formatUserResponse(newUser),
      });
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error stack:', error.stack);
      return res.status(500).json({
        success: false,
        message: 'Server error during registration',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },
];

/**
 * Validation rules for user login
 */
const loginValidationRules = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = [
  ...loginValidationRules,

  async (req, res) => {
    // Guard: Check validation errors
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: validationErrors.array(),
      });
    }

    const { email, password } = req.body;

    try {
      // Find user by email (include password field for comparison)
      const authenticatedUser = await User.findOne({ email }).select('+password');

      // Guard: Check if user exists
      if (!authenticatedUser) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Guard: Verify password
      const isPasswordValid = await authenticatedUser.matchPassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      const authToken = generateAuthToken(authenticatedUser._id);

      res.json({
        success: true,
        token: authToken,
        user: formatUserResponse(authenticatedUser),
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login',
      });
    }
  },
];

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    res.json({
      success: true,
      user: {
        ...formatUserResponse(currentUser),
        createdAt: currentUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;

    // Guard: Validate at least one field is provided
    if (!name && !email && !avatar) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, or avatar to update',
      });
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (avatar) updateFields.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      user: formatUserResponse(updatedUser),
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Upload user avatar
// @route   POST /api/auth/upload-avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    // Guard: Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file',
      });
    }

    // Convert buffer to base64 data URI (memory storage - no disk I/O)
    const mimeType = req.file.mimetype;
    const base64Image = req.file.buffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64Image}`;

    // Update user's avatar with base64 data URI
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: dataUri },
      {
        new: true,
        runValidators: true,
      }
    );

    console.log(`✅ Avatar updated for user: ${updatedUser.email}`);

    res.json({
      success: true,
      user: formatUserResponse(updatedUser),
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during avatar upload',
    });
  }
};