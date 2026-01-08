// models/AuditLog.js - Audit Logging Model
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // Action Information
  action: {
    type: String,
    required: true,
    enum: [
      // User Actions
      'USER_CREATED',
      'USER_UPDATED',
      'USER_DELETED',
      'USER_STATUS_CHANGED',
      'USER_ROLE_CHANGED',
      
      // Authentication Actions
      'LOGIN_SUCCESS',
      'LOGIN_FAILED',
      'LOGOUT',
      'PASSWORD_RESET_REQUESTED',
      'PASSWORD_RESET_COMPLETED',
      'EMAIL_VERIFIED',
      
      // Course Actions
      'COURSE_CREATED',
      'COURSE_UPDATED',
      'COURSE_DELETED',
      'COURSE_ENROLLED',
      'COURSE_UNENROLLED',
      
      // Role & Permission Actions
      'ROLE_ASSIGNED',
      'ROLE_REMOVED',
      'PERMISSION_GRANTED',
      'PERMISSION_REVOKED',
      
      // Security Events
      'ACCOUNT_LOCKED',
      'ACCOUNT_UNLOCKED',
      'SUSPICIOUS_ACTIVITY',
      
      // System Actions
      'SETTINGS_CHANGED',
      'BULK_IMPORT',
      'DATA_EXPORTED'
    ]
  },

  // Actor (who performed the action)
  actorUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  actorEmail: {
    type: String,
    default: null
  },
  actorRole: {
    type: String,
    default: null
  },

  // Target (what was affected)
  entityType: {
    type: String,
    enum: ['USER', 'COURSE', 'ENROLLMENT', 'ROLE', 'PERMISSION', 'SETTING', 'SYSTEM'],
    default: null
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  entityName: {
    type: String,
    default: null
  },

  // Request Details
  ip: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },

  // Additional Context
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Status
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'WARNING'],
    default: 'SUCCESS'
  },

  // Error Details (if action failed)
  errorMessage: {
    type: String,
    default: null
  }

}, {
  timestamps: true // createdAt, updatedAt
});

// Indexes for efficient queries
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ actorUserId: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ ip: 1 });

// TTL Index - auto-delete logs older than 1 year (optional)
// auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
