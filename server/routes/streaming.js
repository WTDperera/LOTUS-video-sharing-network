const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

// CRITICAL: Video streaming CORS - Must be permissive for browser playback
// This middleware runs before the controller to set headers on ALL /video requests
router.use((req, res, next) => {
  // Permissive CORS for video streaming (206 Partial Content support)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length, Content-Type');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Accept-Ranges', 'bytes');
  
  // Handle preflight OPTIONS requests
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
