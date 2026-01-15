// controllers/user/userController.js - User Management Controller
const User = require('../../models/User');
const AuditService = require('../../services/auditService');

/**
 * GET ALL USERS - with pagination, search, and filters
 * GET /api/users
 * Query params: page, limit, search, role, status, sortBy, sortOrder
 * Access: Admin, Manager
 */
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filter = {};

    // Search by name or email
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by role
    if (role) {
      filter.role = role;
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Execute query
    const [users, totalCount] = await Promise.all([
      User.find(filter)
        .select('-password -resetPasswordToken -emailVerificationToken')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        users,
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
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

/**
 * GET SINGLE USER by ID
 * GET /api/users/:id
 * Access: Admin, Manager, or own profile
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password -resetPasswordToken -emailVerificationToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

/**
 * CREATE USER (by Admin/Manager)
 * POST /api/users
 * Body: { email, password, firstName, lastName, role, phone, etc. }
 * Access: Admin, Manager
 */
exports.createUser = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      username,
      phone,
      role,
      status
    } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, firstName, and lastName are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      username,
      phone,
      role: role || 'student',
      status: status || 'active',
      createdBy: req.userId, // Track who created this user
      emailVerified: false
    });

    await newUser.save();

    // Log audit event
    await AuditService.logUserCreated(newUser, req, req.user);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: newUser.toSafeObject()
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

/**
 * UPDATE USER
 * PUT /api/users/:id
 * Body: { firstName, lastName, phone, role, status, etc. }
 * Access: Admin, Manager, or own profile (limited fields)
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permissions
    const isOwnProfile = req.userId.toString() === id;
    const isAdmin = req.user.role === 'admin';
    const isManager = req.user.role === 'manager';

    // Prevent password update through this endpoint
    if (updates.password) {
      delete updates.password;
    }

    // Only admin can change role and status
    if (!isAdmin && (updates.role || updates.status)) {
      return res.status(403).json({
        success: false,
        message: 'Only admin can change role and status'
      });
    }

    // Manager cannot modify admin users
    if (isManager && user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Managers cannot modify admin users'
      });
    }

    // If updating own profile, limit fields
    if (isOwnProfile && !isAdmin && !isManager) {
      const allowedFields = ['firstName', 'lastName', 'phone', 'bio', 'profilePicture', 'preferences', 'interests'];
      Object.keys(updates).forEach(key => {
        if (!allowedFields.includes(key)) {
          delete updates[key];
        }
      });
    }

    // Update user
    Object.assign(user, updates);
    await user.save();

    // Log audit event
    await AuditService.logUserUpdated(user, updates, req);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: user.toSafeObject()
      }
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

/**
 * DELETE USER (soft delete - change status to inactive)
 * DELETE /api/users/:id
 * Access: Admin only
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting self
    if (req.userId.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Soft delete - change status to inactive
    user.status = 'inactive';
    await user.save();

    // Log audit event
    await AuditService.logUserDeleted(user, req);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

/**
 * CHANGE USER STATUS
 * PATCH /api/users/:id/status
 * Body: { status: 'active' | 'suspended' | 'inactive' }
 * Access: Admin, Manager
 */
exports.changeUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['active', 'suspended', 'inactive', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent changing own status
    if (req.userId.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own account status'
      });
    }

    // Manager cannot change admin status
    if (req.user.role === 'manager' && user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Managers cannot modify admin users'
      });
    }

    // Store old status
    const oldStatus = user.status;

    // Update status
    user.status = status;
    await user.save();

    // Log audit event
    await AuditService.logUserStatusChanged(user, oldStatus, status, req);

    res.status(200).json({
      success: true,
      message: `User status changed to ${status}`,
      data: {
        user: user.toSafeObject()
      }
    });

  } catch (error) {
    console.error('Error changing user status:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing user status',
      error: error.message
    });
  }
};

/**
 * GET USER STATS
 * GET /api/users/stats
 * Access: Admin, Manager
 */
exports.getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          suspendedUsers: {
            $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] }
          },
          inactiveUsers: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          },
          adminCount: {
            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
          },
          teacherCount: {
            $sum: { $cond: [{ $eq: ['$role', 'teacher'] }, 1, 0] }
          },
          studentCount: {
            $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        suspendedUsers: 0,
        inactiveUsers: 0,
        adminCount: 0,
        teacherCount: 0,
        studentCount: 0
      }
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user stats',
      error: error.message
    });
  }
};
