const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

// Video Streaming Routes - Professional CORS handling for media streaming

// Apply CORS middleware to all streaming routes
router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// @route   GET /video/:id
// @desc    Stream video with range support (206 Partial Content)
// @access  Public
router.get('/:id', videoController.streamVideo);

module.exports = router;
