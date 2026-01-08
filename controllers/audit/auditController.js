// controllers/audit/auditController.js - Audit Log Controller
const AuditLog = require('../../models/AuditLog');

/**
 * GET ALL AUDIT LOGS with filters
 * GET /api/audit
 * Access: Admin only
 */
exports.getAllAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      action = '',
      actorUserId = '',
      entityType = '',
      startDate = '',
      endDate = '',
      status = '',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};

    if (action) filter.action = action;
    if (actorUserId) filter.actorUserId = actorUserId;
    if (entityType) filter.entityType = entityType;
    if (status) filter.status = status;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { createdAt: sortOrder === 'desc' ? -1 : 1 };

    // Execute query
    const [logs, totalCount] = await Promise.all([
      AuditLog.find(filter)
        .populate('actorUserId', 'firstName lastName email role')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      AuditLog.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          limit: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit logs',
      error: error.message
    });
  }
};

/**
 * GET AUDIT LOGS FOR SPECIFIC USER
 * GET /api/audit/user/:userId
 * Access: Admin, or own logs
 */
exports.getUserAuditLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check permission - only admin or own logs
    if (req.user.role !== 'admin' && req.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own audit logs'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, totalCount] = await Promise.all([
      AuditLog.find({ actorUserId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AuditLog.countDocuments({ actorUserId: userId })
    ]);

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user audit logs',
      error: error.message
    });
  }
};

/**
 * GET AUDIT STATISTICS
 * GET /api/audit/stats
 * Access: Admin only
 */
exports.getAuditStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Aggregate statistics
    const [actionStats, statusStats, totalCount] = await Promise.all([
      // Count by action type
      AuditLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // Count by status
      AuditLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Total count
      AuditLog.countDocuments(dateFilter)
    ]);

    // Recent failed actions
    const recentFailed = await AuditLog.find({
      ...dateFilter,
      status: 'FAILED'
    })
      .populate('actorUserId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalLogs: totalCount,
        actionStats,
        statusStats,
        recentFailed
      }
    });

  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit statistics',
      error: error.message
    });
  }
};

/**
 * GET RECENT ACTIVITY
 * GET /api/audit/recent
 * Access: Admin only
 */
exports.getRecentActivity = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const recentLogs = await AuditLog.find()
      .populate('actorUserId', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        logs: recentLogs
      }
    });

  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activity',
      error: error.message
    });
  }
};
