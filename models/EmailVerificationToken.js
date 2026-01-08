// models/EmailVerificationToken.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const emailVerificationTokenSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for auto-deletion of expired tokens
emailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create verification token
emailVerificationTokenSchema.statics.createVerificationToken = async function(userId) {
  // Delete any existing tokens for this user
  await this.deleteMany({ userId });

  // Generate random token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const verificationToken = await this.create({
    userId,
    token,
    expiresAt
  });

  return { token, expiresAt };
};

// Static method to check if user has pending token
emailVerificationTokenSchema.statics.hasPendingToken = async function(userId) {
  const token = await this.findOne({ 
    userId, 
    expiresAt: { $gt: new Date() } 
  });
  return !!token;
};

module.exports = mongoose.model('EmailVerificationToken', emailVerificationTokenSchema);
