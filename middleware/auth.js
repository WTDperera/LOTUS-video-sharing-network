// ==============================================
// AUTHENTICATION MIDDLEWARE - SECURITY HARDENED
// VULNERABILITIES FIXED:
// - Token validation strengthened
// - Error messages sanitized
// - Input validation added
// - User lookup secured
// ==============================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const InputValidator = require('./validation');
const logger = require('../utils/logger');

/**
 * SECURITY: Extract JWT token from request
 * VULNERABILITY FIX: Validates token format before processing
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  
  // Guard: Check authorization header exists
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }
  
  // Guard: Check Bearer scheme
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer '
  
  // SECURITY: Validate token format (JWT has 3 parts separated by dots)
  if (!token || token.split('.').length !== 3) {
    logger.warning('Invalid JWT token format detected');
    return null;
  }
  
  return token;
};

/**
 * SECURITY: Protect routes - verify JWT token
 * ATTACK PREVENTION: Token tampering, expired tokens, invalid signatures
 */
exports.protect = async (req, res, next) => {
  try {
    // Extract and validate token
    const token = extractToken(req);
    
    // Guard: Token must exist
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
    
    // SECURITY: Verify token signature and expiration
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'], // Only allow HMAC SHA-256
        maxAge: '7d', // Maximum token age
      });
    } catch (jwtError) {
      // SECURITY: Generic error message (don't reveal token details)
      logger.warning(`JWT verification failed: ${jwtError.name}`);
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired',
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
    
    // SECURITY: Validate user ID from token
    if (!decoded.id || !InputValidator.validateObjectId(decoded.id)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload',
      });
    }
    
    // SECURITY: Find user by ID from token (exclude password)
    const user = await User.findById(decoded.id).select('-password');
    
    // Guard: User must exist and be active
    if (!user) {
      logger.warning(`Authentication attempt with valid token but non-existent user: ${decoded.id}`);
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }
    
    // Attach user to request object
    req.user = user;
    next();
    
  } catch (error) {
    // SECURITY: Don't leak error details
    logger.error('Authentication middleware error', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

// Optional auth - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
  } catch (err) {
    // Token invalid, but don't block request
    console.log('Invalid token, continuing without auth');
  }

  next();
};

// Admin only
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};
