const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

// Video Streaming Routes - Presentation Layer

// @route   OPTIONS /video/:id
// @desc    Handle CORS preflight for video streaming
// @access  Public
router.options('/:id', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range');
  res.sendStatus(200);
});

// @route   GET /video/:id
// @desc    Stream video with range support
// @access  Public
router.get('/:id', videoController.streamVideo);

module.exports = router;
