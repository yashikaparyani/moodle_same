// models/PasswordResetToken.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const passwordResetTokenSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: false,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for auto-deletion of expired tokens
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
passwordResetTokenSchema.index({ organizationId: 1, userId: 1 });

// Static method to create password reset token
passwordResetTokenSchema.statics.createResetToken = async function(userId) {
  // Delete any existing unused tokens for this user
  await this.deleteMany({ userId, used: false });

  // Generate random token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

  const resetToken = await this.create({
    userId,
    token,
    expiresAt
  });

  return { token, expiresAt };
};

// Static method to verify and use token
passwordResetTokenSchema.statics.verifyToken = async function(token) {
  const resetToken = await this.findOne({
    token,
    used: false,
    expiresAt: { $gt: new Date() }
  });

  if (!resetToken) {
    return null;
  }

  // Mark as used
  resetToken.used = true;
  await resetToken.save();

  return resetToken;
};

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
