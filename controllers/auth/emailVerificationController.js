// controllers/auth/emailVerificationController.js
const User = require('../../models/User');
const EmailVerificationToken = require('../../models/EmailVerificationToken');
const AuditService = require('../../services/auditService');

/**
 * SEND VERIFICATION EMAIL
 * POST /api/auth/send-verification
 * Body: { email }
 */
exports.sendVerificationEmail = async (req, res) => {
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
        message: 'If an account exists with this email, a verification link will be sent.'
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate verification token
    const { token, expiresAt } = await EmailVerificationToken.createVerificationToken(user._id);

    // Build verification URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

    // TODO: In production, integrate with email service (NodeMailer, SendGrid, etc.)
    // For now, we'll just log it to console
    console.log('=================================');
    console.log('📧 EMAIL VERIFICATION REQUEST');
    console.log('=================================');
    console.log(`User: ${user.email}`);
    console.log(`Name: ${user.firstName} ${user.lastName}`);
    console.log(`Verify URL: ${verifyUrl}`);
    console.log(`Token expires: ${expiresAt}`);
    console.log('=================================');

    // Log audit event
    await AuditService.log({
      action: 'EMAIL_VERIFIED',
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
      message: 'Verification email sent. Please check your inbox.',
      // In development, include the URL for testing
      ...(process.env.NODE_ENV === 'development' && { verifyUrl })
    });

  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending verification email',
      error: error.message
    });
  }
};

/**
 * VERIFY EMAIL WITH TOKEN
 * GET /api/auth/verify-email/:token
 * Params: token
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Find valid token
    const verificationToken = await EmailVerificationToken.findOne({
      token,
      expiresAt: { $gt: new Date() }
    });

    if (!verificationToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Find user
    const user = await User.findById(verificationToken.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      // Delete token
      await EmailVerificationToken.deleteOne({ _id: verificationToken._id });

      return res.status(200).json({
        success: true,
        message: 'Email was already verified'
      });
    }

    // Mark email as verified
    user.emailVerified = true;
    await user.save();

    // Delete verification token
    await EmailVerificationToken.deleteOne({ _id: verificationToken._id });

    // Log audit event
    await AuditService.log({
      action: 'EMAIL_VERIFIED',
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
      message: 'Email verified successfully!',
      data: {
        user: user.toSafeObject()
      }
    });

  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: error.message
    });
  }
};
