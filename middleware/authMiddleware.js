// middleware/authMiddleware.js - JWT Authentication Middleware
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request object
 * 
 * Usage: router.get('/protected', authenticate, controller)
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided. Please login first.' 
      });
    }

    // Expected format: "Bearer TOKEN"
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format. Use: Bearer <token>' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found. Token may be invalid.' 
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({ 
        success: false,
        message: `Account is ${user.status}. Please contact administrator.` 
      });
    }

    // Attach user to request object
    req.user = user;
    req.userId = user._id;
    
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired. Please login again.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token. Please login again.' 
      });
    }
    
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Authentication error',
      error: error.message 
    });
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user if token is valid, but doesn't reject if no token
 * Useful for routes that work for both authenticated and public users
 * 
 * Usage: router.get('/public-or-private', optionalAuth, controller)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next(); // No token, continue without user
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next(); // Invalid format, continue without user
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.status === 'active') {
      req.user = user;
      req.userId = user._id;
    }
    
    next();
    
  } catch (error) {
    // Token is invalid but that's okay for optional auth
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth
};
