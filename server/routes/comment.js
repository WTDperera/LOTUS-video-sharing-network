const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const InputValidator = require('../middleware/validation');

// Comment Routes - Presentation Layer with Security Validation

// @route   GET /api/videos/:videoId/comments
// @desc    Get all comments for a video
// @access  Public
// SECURITY: Validate video ID format
router.get('/videos/:videoId/comments', InputValidator.validateVideoId(), commentController.getComments);

// @route   POST /api/videos/:videoId/comments
// @desc    Add comment to video
// @access  Private (requires authentication)
// SECURITY: Authentication + video ID validation
router.post('/videos/:videoId/comments', protect, InputValidator.validateVideoId(), commentController.addComment);

// @route   DELETE /api/comments/:id
// @desc    Delete comment
// @access  Private (user can only delete own comments)
router.delete('/comments/:id', protect, commentController.deleteComment);

module.exports = router;
