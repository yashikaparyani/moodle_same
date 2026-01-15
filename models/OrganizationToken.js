// models/OrganizationToken.js
const mongoose = require('mongoose');
const crypto = require('crypto');
const winston = require('winston');

// Create logger for OrganizationToken model
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/organization-token.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const organizationTokenSchema = new mongoose.Schema({
  // Token
  token: {
    type: String,
    required: [true, 'Token is required'],
    unique: true,
    index: true,
    trim: true
  },
  
  // Organization Details (for future registration)
  organizationName: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    minlength: [2, 'Organization name must be at least 2 characters'],
    maxlength: [200, 'Organization name cannot exceed 200 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  
  // Token Status
  status: {
    type: String,
    enum: {
      values: ['active', 'used', 'expired', 'revoked'],
      message: 'Status must be either active, used, expired, or revoked'
    },
    default: 'active',
    index: true
  },
  isUsed: {
    type: Boolean,
    default: false,
    index: true
  },
  usedAt: {
    type: Date
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Associated Organization (after registration)
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    index: true
  },
  
  // Validity
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required'],
    index: true
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
organizationTokenSchema.index({ status: 1, expiresAt: 1 });
organizationTokenSchema.index({ organizationId: 1, status: 1 });
organizationTokenSchema.index({ createdBy: 1, createdAt: -1 });

// Virtual to check if token is expired
organizationTokenSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Static method to generate secure token
organizationTokenSchema.statics.generateToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  logger.info('Generated new organization token');
  return token;
};

// Static method to generate token with prefix
organizationTokenSchema.statics.generateTokenWithPrefix = function(prefix = 'ORG') {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(16).toString('hex');
  const token = `${prefix}_${timestamp}_${random}`;
  logger.info(`Generated prefixed organization token: ${prefix}_${timestamp}_***`);
  return token;
};

// Instance method to check if token is valid
organizationTokenSchema.methods.isValid = function() {
  const valid = (
    this.status === 'active' &&
    !this.isUsed &&
    this.expiresAt > new Date()
  );
  
  logger.info(`Token validation check: ${this.token.substring(0, 10)}... - Valid: ${valid}`);
  return valid;
};

// Instance method to mark token as used
organizationTokenSchema.methods.markAsUsed = async function(userId, organizationId) {
  if (this.isUsed) {
    const error = new Error('Token has already been used');
    logger.error(`Attempted to reuse token: ${this.token.substring(0, 10)}...`);
    throw error;
  }
  
  if (!this.isValid()) {
    const error = new Error('Token is not valid');
    logger.error(`Attempted to use invalid token: ${this.token.substring(0, 10)}...`);
    throw error;
  }
  
  this.status = 'used';
  this.isUsed = true;
  this.usedAt = new Date();
  this.usedBy = userId;
  this.organizationId = organizationId;
  
  await this.save();
  logger.info(`Token marked as used: ${this.token.substring(0, 10)}... by user ${userId}`);
};

// Instance method to revoke token
organizationTokenSchema.methods.revoke = async function(reason = '') {
  if (this.isUsed) {
    const error = new Error('Cannot revoke a used token');
    logger.error(`Attempted to revoke used token: ${this.token.substring(0, 10)}...`);
    throw error;
  }
  
  this.status = 'revoked';
  await this.save();
  logger.info(`Token revoked: ${this.token.substring(0, 10)}... - Reason: ${reason}`);
};

// Pre-save middleware to auto-update expired status
organizationTokenSchema.pre('save', function() {
  if (this.expiresAt < new Date() && this.status === 'active') {
    this.status = 'expired';
    logger.info(`Token auto-expired: ${this.token.substring(0, 10)}...`);
  }
});

// Pre-save validation to prevent duplicate tokens
organizationTokenSchema.pre('save', async function() {
  if (this.isModified('token') || this.isNew) {
    const existing = await this.constructor.findOne({
      token: this.token,
      _id: { $ne: this._id }
    });
    
    if (existing) {
      const error = new Error('Token already exists');
      logger.error(`Duplicate token attempted: ${this.token.substring(0, 10)}...`);
      throw error;
    }
  }
});

// Post-save middleware for logging
organizationTokenSchema.post('save', function(doc) {
  logger.info(`Organization token saved: ${doc.token.substring(0, 10)}... (${doc._id}) - Status: ${doc.status}`);
});

// Post-remove middleware for logging
organizationTokenSchema.post('remove', function(doc) {
  logger.info(`Organization token removed: ${doc.token.substring(0, 10)}... (${doc._id})`);
});

// Error handling middleware for duplicate key
organizationTokenSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    const message = `Token with this ${field} already exists`;
    logger.error(`Duplicate key error in OrganizationToken: ${message}`, { 
      field, 
      value: doc[field] 
    });
    next(new Error(message));
  } else {
    next(error);
  }
});

// Validation error handler
organizationTokenSchema.post('validate', function(error, doc, next) {
  if (error) {
    logger.error('Organization token validation error', { 
      tokenId: doc?._id, 
      errors: error.errors 
    });
  }
  next(error);
});

// Static method to cleanup expired tokens (can be run via cron job)
organizationTokenSchema.statics.cleanupExpiredTokens = async function() {
  try {
    const result = await this.updateMany(
      {
        status: 'active',
        expiresAt: { $lt: new Date() }
      },
      {
        $set: { status: 'expired' }
      }
    );
    
    logger.info(`Cleaned up ${result.modifiedCount} expired tokens`);
    return result.modifiedCount;
  } catch (error) {
    logger.error('Error cleaning up expired tokens', { error: error.message });
    throw error;
  }
};

module.exports = mongoose.model('OrganizationToken', organizationTokenSchema);
