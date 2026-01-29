const multer = require('multer');
const path = require('path');

/**
 * Image Upload Middleware - Memory Storage
 * Stores files in memory buffer for direct base64 conversion
 * No disk I/O required - cleaner and faster
 */
const storage = multer.memoryStorage();

const imageUpload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit for images
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
  }
});

module.exports = imageUpload;
