// config/rateLimiter.js - Rate Limiting Configuration
const rateLimit = require('express-rate-limit');

/**
 * General API Rate Limiter
 * Applied to all /api routes
 * Prevents general API abuse
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    retryAfter: 900 // seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Strict Authentication Limiter
 * Applied to login/register routes
 * Prevents brute force attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  skipSuccessfulRequests: false, // Count successful requests
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes'
  },
  handler: (req, res) => {
    console.log(`🚫 Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  }
});

/**
 * Password Reset Limiter
 * Very strict - prevents abuse of password reset
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 attempts per hour
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again after 1 hour'
  },
  handler: (req, res) => {
    console.log(`🚫 Password reset limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many password reset attempts. Please try again after 1 hour.',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  }
});

/**
 * User Creation Limiter
 * Applied to admin user creation endpoints
 */
const userCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Max 20 users created per hour per IP
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: 'Too many user creation requests, please try again later'
  }
});

/**
 * API Documentation Limiter
 * More relaxed for public docs
 */
const docsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for docs
  skipSuccessfulRequests: true
});

/**
 * File Upload Limiter
 * Prevents mass file uploads
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Max 10 file uploads per hour
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: 'Too many file uploads, please try again after 1 hour'
  },
  handler: (req, res) => {
    console.log(`🚫 File upload limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many file uploads. Maximum 10 files per hour allowed.',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  }
});

/**
 * Organization Registration Limiter
 * Very strict - prevents spam organization creation
 */
const orgRegistrationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // Only 3 organization registrations per day
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: 'Organization registration limit reached. Please try again tomorrow.'
  },
  handler: (req, res) => {
    console.log(`🚫 Organization registration limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many organization registration attempts. Maximum 3 per day allowed.',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  }
});

/**
 * Create custom limiter with specific configuration
 */
const createCustomLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  userCreationLimiter,
  docsLimiter,
  uploadLimiter,
  orgRegistrationLimiter,
  createCustomLimiter
};
