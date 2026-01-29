// ==============================================
// SECURITY CONFIGURATION MODULE
// CRITICAL: Security-first configuration
// VULNERABILITIES FIXED:
// - Hardcoded secrets → Environment variables
// - Missing input validation → Strict validation
// - Missing rate limiting → DDoS protection
// - Missing security headers → Helmet integration
// ==============================================

const crypto = require('crypto');

/**
 * SECURITY: Environment variable validation
 * ATTACK VECTOR PREVENTION: Prevents startup with insecure config
 */
class SecurityConfig {
  constructor() {
    this.validateRequiredSecrets();
    this.validateSecuritySettings();
  }

  /**
   * CRITICAL: Validate all required secrets are present
   * VULNERABILITY: Running without JWT_SECRET allows authentication bypass
   */
  validateRequiredSecrets() {
    const requiredSecrets = [
      'JWT_SECRET',
      'MONGODB_URI',
    ];

    const missingSecrets = requiredSecrets.filter(
      (secret) => !process.env[secret]
    );

    if (missingSecrets.length > 0) {
      throw new Error(
        `SECURITY ERROR: Missing required secrets: ${missingSecrets.join(', ')}\n` +
        'These must be set in .env file or environment variables.'
      );
    }

    // SECURITY: Validate JWT_SECRET strength
    if (process.env.JWT_SECRET.length < 32) {
      throw new Error(
        'SECURITY ERROR: JWT_SECRET must be at least 32 characters long.\n' +
        'Use a cryptographically secure random string.'
      );
    }
  }

  /**
   * SECURITY: Validate security-critical settings
   */
  validateSecuritySettings() {
    // SECURITY: Enforce HTTPS in production
    if (process.env.NODE_ENV === 'production' && !process.env.FORCE_HTTPS) {
      console.warn(
        '⚠️  SECURITY WARNING: HTTPS not enforced in production.\n' +
        'Set FORCE_HTTPS=true in environment variables.'
      );
    }
  }

  /**
   * SECURITY: Generate secure random strings
   * Used for CSRF tokens, session IDs, etc.
   */
  static generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * SECURITY: Constant-time string comparison
   * VULNERABILITY FIX: Prevents timing attacks on token/password comparison
   */
  static constantTimeCompare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
      return false;
    }
    
    if (a.length !== b.length) {
      return false;
    }

    // Use crypto.timingSafeEqual for constant-time comparison
    return crypto.timingSafeEqual(
      Buffer.from(a),
      Buffer.from(b)
    );
  }

  /**
   * SECURITY: Rate limiting configuration
   * ATTACK PREVENTION: DDoS, brute force attacks
   */
  static getRateLimitConfig() {
    return {
      // General API rate limit
      general: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: process.env.RATE_LIMIT_MAX || 100, // requests per window
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
      },
      
      // Auth endpoints (stricter limits)
      auth: {
        windowMs: 15 * 60 * 1000,
        max: 5, // Only 5 login attempts per 15 minutes
        skipSuccessfulRequests: true,
        message: 'Too many authentication attempts, please try again later.',
      },
      
      // Upload endpoints
      upload: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10, // 10 uploads per hour
        message: 'Upload limit reached, please try again later.',
      },
    };
  }

  /**
   * SECURITY: Helmet configuration for security headers
   * ATTACK PREVENTION: XSS, clickjacking, MIME sniffing
   */
  static getHelmetConfig() {
    return {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: 'deny', // Prevent clickjacking
      },
      noSniff: true, // Prevent MIME type sniffing
      xssFilter: true, // Enable XSS filter
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
    };
  }

  /**
   * SECURITY: CORS configuration
   * VULNERABILITY FIX: Restrict allowed origins
   */
  static getCorsConfig() {
    // SECURITY: Only allow specific origins in production
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:5173'];

    return {
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      optionsSuccessStatus: 200,
      maxAge: 86400, // 24 hours
    };
  }

  /**
   * SECURITY: Sensitive data fields to redact from logs
   */
  static getSensitiveFields() {
    return [
      'password',
      'token',
      'authorization',
      'cookie',
      'jwt',
      'secret',
      'apiKey',
      'api_key',
      'accessToken',
      'refreshToken',
      'sessionId',
      'creditCard',
      'ssn',
    ];
  }

  /**
   * SECURITY: Sanitize object for logging
   * VULNERABILITY FIX: Prevents password/token leakage in logs
   */
  static sanitizeForLogging(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = Array.isArray(obj) ? [] : {};
    const sensitiveFields = this.getSensitiveFields();

    for (const [key, value] of Object.entries(obj)) {
      const keyLower = key.toLowerCase();
      
      // Check if field is sensitive
      if (sensitiveFields.some((field) => keyLower.includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else if (value && typeof value === 'object') {
        // Recursively sanitize nested objects
        sanitized[key] = this.sanitizeForLogging(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

module.exports = SecurityConfig;
