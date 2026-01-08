// middleware/roleMiddleware.js - Role-Based Authorization
const User = require('../models/User');

/**
 * Role Hierarchy for Permission Levels
 * Higher number = More permissions
 */
const ROLE_HIERARCHY = {
  admin: 6,
  manager: 5,
  course_creator: 4,
  teacher: 3,
  non_editing_teacher: 2,
  student: 1
};

/**
 * Authorization Middleware - Check if user has required role
 * 
 * @param {...string} allowedRoles - Roles that can access this route
 * @returns {Function} Express middleware
 * 
 * Usage: 
 *   router.get('/admin', authenticate, authorize('admin'), controller)
 *   router.get('/teachers', authenticate, authorize('admin', 'teacher'), controller)
 */
const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated (authMiddleware should run first)
      if (!req.user || !req.userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required. Please login first.'
        });
      }

      const user = req.user;

      // Check if user account is active
      if (user.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: `Account is ${user.status}. Cannot perform this action.`
        });
      }

      // Check if user has required role
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have permission to perform this action.',
          requiredRoles: allowedRoles,
          yourRole: user.role
        });
      }

      // User has permission, continue
      next();
      
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error',
        error: error.message
      });
    }
  };
};

/**
 * Check if user is Admin
 * Shortcut for authorize('admin')
 */
const isAdmin = authorize('admin');

/**
 * Check if user is Admin or Manager
 * For administrative tasks
 */
const isAdminOrManager = authorize('admin', 'manager');

/**
 * Check if user can manage courses
 * Admin, Manager, or Course Creator
 */
const canManageCourses = authorize('admin', 'manager', 'course_creator');

/**
 * Check if user can teach
 * Teachers and above
 */
const canTeach = authorize('admin', 'manager', 'course_creator', 'teacher', 'non_editing_teacher');

/**
 * Check if user has higher or equal privilege than another role
 * @param {string} userRole - User's role
 * @param {string} targetRole - Role to compare against
 * @returns {boolean} True if user has higher/equal privilege
 */
const hasHigherOrEqualRole = (userRole, targetRole) => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[targetRole];
};

/**
 * Middleware: User can only modify their own data or have admin rights
 * 
 * Usage: router.put('/users/:userId', authenticate, canModifyUser, controller)
 */
const canModifyUser = async (req, res, next) => {
  try {
    const requestingUser = req.user;
    const targetUserId = req.params.userId || req.params.id;

    // Admin can modify anyone
    if (requestingUser.role === 'admin') {
      return next();
    }

    // Manager can modify non-admin users
    if (requestingUser.role === 'manager') {
      const targetUser = await User.findById(targetUserId);
      if (targetUser && targetUser.role !== 'admin') {
        return next();
      }
    }

    // Users can modify their own data
    if (requestingUser._id.toString() === targetUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'You can only modify your own profile.'
    });
    
  } catch (error) {
    console.error('Authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error',
      error: error.message
    });
  }
};

module.exports = {
  authorize,
  isAdmin,
  isAdminOrManager,
  canManageCourses,
  canTeach,
  hasHigherOrEqualRole,
  canModifyUser,
  ROLE_HIERARCHY
};
