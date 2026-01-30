// ==============================================
// MIDDLEWARE CONFIGURATION MODULE
// Single Responsibility: Middleware Setup
// SECURITY ENHANCEMENTS:
// - Rate limiting for DDoS protection
// - Input validation and sanitization
// - Security headers (Helmet)
// - Request size limits
// ==============================================

const express = require('express');
const logger = require('../utils/logger');
const SecurityConfig = require('./security');
const SecurityMiddleware = require('../middleware/security');
const InputValidator = require('../middleware/validation');
const { ENVIRONMENT_DEVELOPMENT } = require('./constants');

class MiddlewareConfigurator {
  /**
   * Configure all application middleware with security-first approach
   * @param {Express.Application} app - Express application instance
   * @param {string} environmentMode - Current environment mode
   */
  static configureMiddleware(app, environmentMode) {
    // SECURITY: Force HTTPS in production
    app.use(SecurityMiddleware.forceHTTPS());
    
    // SECURITY: Remove identifying headers
    app.use(SecurityMiddleware.removeSensitiveHeaders());
    
    // SECURITY: Apply all security middleware
    SecurityMiddleware.applySecurityMiddleware(app);
    
    // SECURITY: CORS with strict origin validation
    const cors = require('cors');
    app.use(cors(SecurityConfig.getCorsConfig()));

    // SECURITY: Request size limits (prevent DOS)
    app.use(express.json({ 
      limit: '10mb', // Prevent large payload DOS
      verify: (req, res, buf) => {
        // Store raw body for webhook signature verification if needed
        req.rawBody = buf.toString();
      },
    }));
    app.use(express.urlencoded({ 
      extended: true,
      limit: '10mb',
    }));

    // SECURITY: NoSQL injection prevention
    // TEMPORARILY DISABLED: express-mongo-sanitize incompatible with Express 5.x
    // TODO: Find alternative NoSQL injection prevention or downgrade Express
    // app.use(InputValidator.sanitizeNoSQLInjection());
    
    // SECURITY: Input sanitization
    app.use(InputValidator.sanitizeRequestBody());

    // Static file serving with explicit CORS for media files
    // Critical: Video/image thumbnails need unrestricted access for browser playback
    app.use('/uploads', (req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');
      next();
    }, express.static('uploads', {
      // SECURITY: Disable directory listing
      index: false,
      // SECURITY: Set cache control headers
      setHeaders: (res) => {
        res.set('Cache-Control', 'public, max-age=31536000'); // 1 year
        res.set('X-Content-Type-Options', 'nosniff');
      },
    }));

    // Development logging (after security checks)
    if (environmentMode === ENVIRONMENT_DEVELOPMENT) {
      app.use((request, response, next) => {
        // SECURITY: Sanitize logged data
        const sanitizedBody = SecurityConfig.sanitizeForLogging(request.body);
        logger.logRequest(request.method, request.path);
        next();
      });
    }
  }
}

module.exports = MiddlewareConfigurator;
