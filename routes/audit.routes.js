// routes/audit.routes.js - Audit Log Routes
const express = require('express');
const router = express.Router();

// Import controllers
const auditController = require('../controllers/audit/auditController');

// Import middleware
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

/**
 * @route   GET /api/audit
 * @desc    Get all audit logs with filters
 * @access  Admin only
 */
router.get('/', authenticate, isAdmin, auditController.getAllAuditLogs);

/**
 * @route   GET /api/audit/stats
 * @desc    Get audit statistics
 * @access  Admin only
 */
router.get('/stats', authenticate, isAdmin, auditController.getAuditStats);

/**
 * @route   GET /api/audit/recent
 * @desc    Get recent activity
 * @access  Admin only
 */
router.get('/recent', authenticate, isAdmin, auditController.getRecentActivity);

/**
 * @route   GET /api/audit/user/:userId
 * @desc    Get audit logs for specific user
 * @access  Admin or own logs
 */
router.get('/user/:userId', authenticate, auditController.getUserAuditLogs);

module.exports = router;
