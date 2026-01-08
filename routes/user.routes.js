// routes/user.routes.js - User Management Routes
const express = require('express');
const router = express.Router();

// Import controllers
const userController = require('../controllers/user/userController');

// Import middleware
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin, isAdminOrManager, canModifyUser } = require('../middleware/roleMiddleware');

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics (counts by role, status)
 * @access  Admin, Manager
 */
router.get('/stats', authenticate, isAdminOrManager, userController.getUserStats);

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination and filters
 * @access  Admin, Manager
 */
router.get('/', authenticate, isAdminOrManager, userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get single user by ID
 * @access  Admin, Manager, or own profile
 */
router.get('/:id', authenticate, canModifyUser, userController.getUserById);

/**
 * @route   POST /api/users
 * @desc    Create new user (by admin/manager)
 * @access  Admin, Manager
 */
router.post('/', authenticate, isAdminOrManager, userController.createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user details
 * @access  Admin, Manager, or own profile (limited fields)
 */
router.put('/:id', authenticate, canModifyUser, userController.updateUser);

/**
 * @route   PATCH /api/users/:id/status
 * @desc    Change user status (active/suspended/inactive)
 * @access  Admin, Manager
 */
router.patch('/:id/status', authenticate, isAdminOrManager, userController.changeUserStatus);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (soft delete - changes status to inactive)
 * @access  Admin only
 */
router.delete('/:id', authenticate, isAdmin, userController.deleteUser);

module.exports = router;
