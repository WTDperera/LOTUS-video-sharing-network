const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { optionalAuth, protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const InputValidator = require('../middleware/validation');

// Video Routes - Presentation Layer with Security Validation

// @route   GET /api/videos
// @desc    Get all videos (with optional search)
// @access  Public
router.get('/', optionalAuth, videoController.getAllVideos);

// @route   GET /api/videos/:id
// @desc    Get single video by ID
// @access  Public
// SECURITY: Validate MongoDB ObjectId format
router.get('/:id', optionalAuth, InputValidator.validateVideoId(), videoController.getVideoById);

// @route   POST /api/videos/upload
// @desc    Upload new video
// @access  Private/Public (optionalAuth allows both)
// SECURITY: File validation, content length check
router.post(
  '/upload',
  optionalAuth,
  InputValidator.validateContentLength(52428800), // 50MB limit
  upload.single('video'),
  InputValidator.validateFileUpload(
    ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/x-flv', 'video/x-matroska', 'video/webm'],
    52428800
  ),
  videoController.uploadVideo
);

// @route   POST /api/videos/:id/view
// @desc    Increment video view count
// @access  Public
// SECURITY: Validate video ID
router.post('/:id/view', InputValidator.validateVideoId(), videoController.incrementViews);

// @route   POST /api/videos/:id/like
// @desc    Like or unlike a video
// @access  Private (requires authentication)
// SECURITY: Validate video ID format
router.post('/:id/like', protect, InputValidator.validateVideoId(), videoController.likeVideo);

// @route   POST /api/videos/:id/dislike
// @desc    Dislike or remove dislike from a video
// @access  Private (requires authentication)
// SECURITY: Validate video ID format
router.post('/:id/dislike', protect, InputValidator.validateVideoId(), videoController.dislikeVideo);
router.post('/:id/dislike', protect, videoController.dislikeVideo);

// @route   GET /api/videos/:id/thumbnail
// @desc    Get video thumbnail
// @access  Public
router.get('/:id/thumbnail', videoController.getThumbnail);

// @route   DELETE /api/videos/:id
// @desc    Delete video by ID
// @access  Private (requires authentication)
router.delete('/:id', protect, videoController.deleteVideo);

module.exports = router;
