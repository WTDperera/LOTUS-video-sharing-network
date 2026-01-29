// ==============================================
// FILE UPLOAD MIDDLEWARE - SECURITY HARDENED
// VULNERABILITIES FIXED:
// - Filename sanitization (command injection prevention)
// - MIME type validation (malicious file prevention)
// - File size limits (DOS prevention)
// ==============================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const InputValidator = require('./validation');

// File Upload Middleware Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // SECURITY: Sanitize filename to prevent command injection
    try {
      const sanitizedOriginal = InputValidator.sanitizeFilename(
        path.basename(file.originalname, path.extname(file.originalname))
      );
      
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname).toLowerCase();
      cb(null, `${sanitizedOriginal}-${uniqueSuffix}${extension}`);
    } catch (error) {
      cb(new Error('Invalid filename'));
    }
  }
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // SECURITY: Strict MIME type validation
    const allowedMimes = [
      'video/mp4',
      'video/avi',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-ms-wmv',
      'video/x-flv',
      'video/x-matroska',
      'video/webm',
    ];
    
    // SECURITY: Validate file extension
    const allowedExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'];
    const extension = path.extname(file.originalname).toLowerCase();
    
    // SECURITY: Both MIME type and extension must match
    if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(extension)) {
      return cb(null, true);
    }
    
    cb(new Error('Only video files are allowed (mp4, avi, mov, wmv, flv, mkv, webm)'));
  }
});

module.exports = upload;
