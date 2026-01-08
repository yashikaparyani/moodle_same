// controllers/auth/passwordResetController.js
const User = require('../../models/User');
const PasswordResetToken = require('../../models/PasswordResetToken');
const AuditService = require('../../services/auditService');
const bcrypt = require('bcryptjs');

/**
 * REQUEST PASSWORD RESET
 * POST /api/auth/forgot-password
 * Body: { email }
 */
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link will be sent.'
      });
    }

    // Generate reset token
    const { token, expiresAt } = await PasswordResetToken.createResetToken(user._id);

    // Build reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    // TODO: In production, integrate with email service
    console.log('=================================');
    console.log('🔐 PASSWORD RESET REQUEST');
    console.log('=================================');
    console.log(`User: ${user.email}`);
    console.log(`Name: ${user.firstName} ${user.lastName}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`Token expires: ${expiresAt}`);
    console.log('=================================');

    // Log audit event
    await AuditService.log({
      action: 'PASSWORD_RESET_REQUESTED',
      actorUserId: user._id,
      actorEmail: user.email,
      entityType: 'USER',
      entityId: user._id,
      metadata: {
        email: user.email
      },
      status: 'SUCCESS'
    }, req);

    res.status(200).json({
      success: true,
      message: 'Password reset link sent. Please check your email.',
      // In development, include the URL for testing
      ...(process.env.NODE_ENV === 'development' && { resetUrl, token })
    });

  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({
      success: false,
      message: 'Error requesting password reset',
      error: error.message
    });
  }
};

/**
 * RESET PASSWORD WITH TOKEN
 * POST /api/auth/reset-password
 * Body: { token, newPassword }
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Verify token
    const resetToken = await PasswordResetToken.verifyToken(token);

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Find user
    const user = await User.findById(resetToken.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    
    // Reset failed login attempts if account was locked
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    
    await user.save();

    // Log audit event
    await AuditService.log({
      action: 'PASSWORD_RESET_COMPLETED',
      actorUserId: user._id,
      actorEmail: user.email,
      entityType: 'USER',
      entityId: user._id,
      metadata: {
        email: user.email
      },
      status: 'SUCCESS'
    }, req);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};

/**
 * CHANGE PASSWORD (for logged-in users)
 * POST /api/auth/change-password
 * Body: { currentPassword, newPassword }
 * Requires: Authentication
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Check if new password is same as current
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Get user (attached by authMiddleware)
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Log audit event
    await AuditService.log({
      action: 'PASSWORD_RESET_COMPLETED',
      actorUserId: user._id,
      actorEmail: user.email,
      entityType: 'USER',
      entityId: user._id,
      metadata: {
        email: user.email,
        method: 'change-password'
      },
      status: 'SUCCESS'
    }, req);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};
