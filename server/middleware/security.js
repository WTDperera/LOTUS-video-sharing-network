// ==============================================
// SECURITY MIDDLEWARE SUITE
// CRITICAL: Defense-in-depth security layers
// ==============================================

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const SecurityConfig = require('../config/security');
const logger = require('../utils/logger');

class SecurityMiddleware {
  constructor() {
    // Initialize rate limiters ONCE at startup to avoid ValidationError
    const rateLimitConfig = SecurityConfig.getRateLimitConfig();

    // General API rate limit
    this.generalLimiter = rateLimit(rateLimitConfig.general);

    // Auth endpoints - stricter limits
    this.authLimiter = rateLimit(rateLimitConfig.auth);

    // Upload endpoints - file upload limits
    this.uploadLimiter = rateLimit(rateLimitConfig.upload);
  }

  /**
   * SECURITY: Apply all security middleware
   */
  applySecurityMiddleware(app) {
    // 1. Helmet - Security headers
    app.use(helmet(SecurityConfig.getHelmetConfig()));
    
    // 2. Rate limiting - DDoS protection
    this.applyRateLimiting(app);
    
    // 3. Request size limits
    this.applyRequestSizeLimits(app);
    
    // 4. Security monitoring
    this.applySecurityMonitoring(app);
  }

  /**
   * SECURITY: Rate limiting configuration
   * ATTACK PREVENTION: Brute force, DDoS
   */
  applyRateLimiting(app) {
    // Use pre-initialized limiters
    app.use('/api/', this.generalLimiter);
    app.use('/api/auth/login', this.authLimiter);
    app.use('/api/auth/register', this.authLimiter);
    app.use('/api/videos/upload', this.uploadLimiter);
    app.use('/api/auth/upload-avatar', this.uploadLimiter);
  }

  /**
   * SECURITY: Request size limits
   * ATTACK PREVENTION: Memory exhaustion attacks
   */
  applyRequestSizeLimits(app) {
    // Already handled by express.json({ limit }) in middleware.js
    // This is a reminder to keep those limits in place
  }

  /**
   * SECURITY: Monitor and log security events
   */
  applySecurityMonitoring(app) {
    app.use((req, res, next) => {
      // Log suspicious patterns
      const suspiciousPatterns = [
        /\.\./,  // Path traversal
        /<script/i,  // XSS
        /union.*select/i,  // SQL injection
        /\$where/i,  // NoSQL injection
        /__proto__/,  // Prototype pollution
      ];

      const requestString = JSON.stringify({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(requestString)) {
          logger.warning(
            `Suspicious request detected from ${req.ip}: ${req.method} ${req.path}`
          );
          break;
        }
      }

      next();
    });
  }

  /**
   * SECURITY: HTTPS redirect in production
   */
  forceHTTPS() {
    return (req, res, next) => {
      if (process.env.NODE_ENV === 'production' && process.env.FORCE_HTTPS === 'true') {
        if (req.headers['x-forwarded-proto'] !== 'https') {
          return res.redirect(301, `https://${req.headers.host}${req.url}`);
        }
      }
      next();
    };
  }

  /**
   * SECURITY: Remove sensitive headers
   */
  removeSensitiveHeaders() {
    return (req, res, next) => {
      res.removeHeader('X-Powered-By');
      next();
    };
  }
}

module.exports = new SecurityMiddleware();
