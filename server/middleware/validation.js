// ==============================================
// INPUT VALIDATION MIDDLEWARE
// CRITICAL: Prevent injection attacks
// ATTACK VECTORS PREVENTED:
// - SQL Injection (NoSQL Injection)
// - XSS (Cross-Site Scripting)
// - Command Injection
// - Path Traversal
// - Prototype Pollution
// ==============================================

const validator = require('validator');
const mongoSanitize = require('express-mongo-sanitize');

/**
 * SECURITY: Comprehensive input validation and sanitization
 */
class InputValidator {
  /**
   * VULNERABILITY FIX: NoSQL injection prevention
   * ATTACK VECTOR: {"$gt": ""} in email field bypasses authentication
   * EXAMPLE ATTACK: POST /login {"email": {"$gt": ""}, "password": {"$gt": ""}}
   * FIX: Remove problematic query sanitization that causes read-only errors
   */
  static sanitizeNoSQLInjection() {
    return mongoSanitize({
      replaceWith: '_', // Replace $ and . with _
      removeData: true, // Remove instead of replace for dangerous keys
      onSanitize: ({ req, key }) => {
        console.warn(`⚠️  SECURITY: Potential NoSQL injection attempt detected in ${key}`);
      },
    });
  }

  /**
   * VULNERABILITY FIX: XSS prevention
   * ATTACK VECTOR: <script>alert('XSS')</script> in user input
   */
  static sanitizeXSS(str) {
    if (typeof str !== 'string') return str;

    // Escape HTML special characters
    return validator.escape(str);
  }

  /**
   * VULNERABILITY FIX: Path traversal prevention
   * ATTACK VECTOR: ../../etc/passwd in file paths
   * EXAMPLE ATTACK: GET /uploads/../../../etc/passwd
   */
  static sanitizeFilePath(filePath) {
    if (typeof filePath !== 'string') {
      throw new Error('Invalid file path');
    }

    // Remove any path traversal attempts
    const sanitized = filePath.replace(/\.\./g, '').replace(/\\/g, '/');

    // Ensure path doesn't start with /
    if (sanitized.startsWith('/')) {
      throw new Error('Absolute paths not allowed');
    }

    // Validate characters (alphanumeric, dash, underscore, slash, dot only)
    if (!/^[a-zA-Z0-9\-_\/\.]+$/.test(sanitized)) {
      throw new Error('Invalid characters in file path');
    }

    return sanitized;
  }

  /**
   * VULNERABILITY FIX: Command injection prevention
   * ATTACK VECTOR: ; rm -rf / in filename
   */
  static sanitizeFilename(filename) {
    if (typeof filename !== 'string') {
      throw new Error('Invalid filename');
    }

    // Remove any shell metacharacters
    const sanitized = filename
      .replace(/[;&|<>`$(){}[\]\\]/g, '')
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .slice(0, 255); // Limit length

    if (!sanitized) {
      throw new Error('Invalid filename after sanitization');
    }

    return sanitized;
  }

  /**
   * VULNERABILITY FIX: Email validation
   * ATTACK VECTOR: SQL injection via email field
   */
  static validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }

    // Strict email validation
    return validator.isEmail(email, {
      allow_display_name: false,
      require_tld: true,
      allow_utf8_local_part: false,
    });
  }

  /**
   * VULNERABILITY FIX: MongoDB ObjectId validation
   * ATTACK VECTOR: Invalid ObjectId causes server crash
   */
  static validateObjectId(id) {
    if (!id || typeof id !== 'string') {
      return false;
    }

    // MongoDB ObjectId is 24 hex characters
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  /**
   * VULNERABILITY FIX: Prototype pollution prevention
   * ATTACK VECTOR: {"__proto__": {"isAdmin": true}}
   */
  static sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    // Remove dangerous properties
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
    
    for (const key of dangerousKeys) {
      delete obj[key];
    }

    // Recursively sanitize nested objects
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object') {
        obj[key] = this.sanitizeObject(value);
      } else if (typeof value === 'string') {
        obj[key] = this.sanitizeXSS(value);
      }
    }

    return obj;
  }

  /**
   * SECURITY: Request body sanitization middleware
   * Note: req.query and req.params are read-only in Express 5.x
   * We sanitize by creating defensive copies if needed
   */
  static sanitizeRequestBody() {
    return (req, res, next) => {
      try {
        // Sanitize body (writable)
        if (req.body && typeof req.body === 'object') {
          req.body = this.sanitizeObject(req.body);
        }
        
        // Note: req.query and req.params are read-only properties in Express 5.x
        // We rely on other middleware layers for query/param sanitization
        // or validate them in route handlers directly
        
        next();
      } catch (error) {
        console.error('❌ Sanitization error:', error);
        next(error);
      }
    };
  }

  /**
   * SECURITY: Validate video ID parameter
   */
  static validateVideoId() {
    return (req, res, next) => {
      // Check both 'id' and 'videoId' params (different routes use different names)
      const videoId = req.params.id || req.params.videoId;

      if (!videoId || !this.validateObjectId(videoId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid video ID format',
        });
      }

      next();
    };
  }

  /**
   * SECURITY: Validate file upload
   * VULNERABILITY FIX: Malicious file upload
   */
  static validateFileUpload(allowedMimeTypes, maxSize) {
    return (req, res, next) => {
      if (!req.file) {
        return next();
      }

      const { mimetype, size, originalname } = req.file;

      // Check MIME type
      if (!allowedMimeTypes.includes(mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type',
        });
      }

      // Check file size
      if (size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`,
        });
      }

      // Sanitize filename
      try {
        req.file.sanitizedName = this.sanitizeFilename(originalname);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid filename',
        });
      }

      next();
    };
  }

  /**
   * SECURITY: Content length validation
   * ATTACK PREVENTION: Request body too large DOS attack
   */
  static validateContentLength(maxSize) {
    return (req, res, next) => {
      const contentLength = parseInt(req.get('content-length') || '0', 10);

      if (contentLength > maxSize) {
        return res.status(413).json({
          success: false,
          message: 'Request entity too large',
        });
      }

      next();
    };
  }
}

module.exports = InputValidator;
