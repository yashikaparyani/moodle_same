// services/auditService.js - Centralized Audit Logging Service
const AuditLog = require('../models/AuditLog');

class AuditService {
  /**
   * Extract request context (IP and User-Agent)
   */
  static getRequestContext(req) {
    if (!req) return { ip: null, userAgent: null };

    const ip = req.ip ||
               req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
               req.connection?.remoteAddress ||
               null;

    const userAgent = req.headers['user-agent'] || null;

    return { ip, userAgent };
  }

  /**
   * Extract actor information from request
   */
  static getActorInfo(req) {
    if (!req || !req.user) {
      return {
        actorUserId: null,
        actorEmail: null,
        actorRole: null
      };
    }

    return {
      actorUserId: req.user._id || req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role
    };
  }

  /**
   * Log an audit event
   */
  static async log(params, req = null) {
    try {
      const { ip, userAgent } = this.getRequestContext(req);
      const actorInfo = params.actorUserId ? {} : this.getActorInfo(req);

      const auditLog = new AuditLog({
        ...actorInfo,
        ...params,
        ip: params.ip || ip,
        userAgent: params.userAgent || userAgent
      });

      await auditLog.save();
      return auditLog;
    } catch (error) {
      // Log error but don't throw - audit logging should not break main flow
      console.error('❌ Audit log error:', error.message);
      return null;
    }
  }

  // ============= USER EVENTS =============

  /**
   * Log user creation
   */
  static async logUserCreated(user, req, createdBy = null) {
    return this.log({
      action: 'USER_CREATED',
      entityType: 'USER',
      entityId: user._id,
      entityName: `${user.firstName} ${user.lastName}`,
      metadata: {
        email: user.email,
        role: user.role,
        createdByEmail: createdBy?.email || 'self-registration'
      },
      status: 'SUCCESS'
    }, req);
  }

  /**
   * Log user update
   */
  static async logUserUpdated(user, changes, req) {
    return this.log({
      action: 'USER_UPDATED',
      entityType: 'USER',
      entityId: user._id,
      entityName: `${user.firstName} ${user.lastName}`,
      metadata: {
        email: user.email,
        changes
      },
      status: 'SUCCESS'
    }, req);
  }

  /**
   * Log user deletion
   */
  static async logUserDeleted(user, req) {
    return this.log({
      action: 'USER_DELETED',
      entityType: 'USER',
      entityId: user._id,
      entityName: `${user.firstName} ${user.lastName}`,
      metadata: {
        email: user.email,
        role: user.role
      },
      status: 'SUCCESS'
    }, req);
  }

  /**
   * Log user status change
   */
  static async logUserStatusChanged(user, oldStatus, newStatus, req) {
    return this.log({
      action: 'USER_STATUS_CHANGED',
      entityType: 'USER',
      entityId: user._id,
      entityName: `${user.firstName} ${user.lastName}`,
      metadata: {
        email: user.email,
        oldStatus,
        newStatus
      },
      status: 'SUCCESS'
    }, req);
  }

  /**
   * Log user role change
   */
  static async logUserRoleChanged(user, oldRole, newRole, req) {
    return this.log({
      action: 'USER_ROLE_CHANGED',
      entityType: 'USER',
      entityId: user._id,
      entityName: `${user.firstName} ${user.lastName}`,
      metadata: {
        email: user.email,
        oldRole,
        newRole
      },
      status: 'SUCCESS'
    }, req);
  }

  // ============= AUTHENTICATION EVENTS =============

  /**
   * Log successful login
   */
  static async logLoginSuccess(user, req) {
    return this.log({
      action: 'LOGIN_SUCCESS',
      actorUserId: user._id,
      actorEmail: user.email,
      actorRole: user.role,
      entityType: 'USER',
      entityId: user._id,
      entityName: `${user.firstName} ${user.lastName}`,
      metadata: {
        email: user.email
      },
      status: 'SUCCESS'
    }, req);
  }

  /**
   * Log failed login attempt
   */
  static async logLoginFailed(email, reason, req) {
    return this.log({
      action: 'LOGIN_FAILED',
      actorEmail: email,
      entityType: 'USER',
      metadata: {
        email,
        reason
      },
      status: 'FAILED',
      errorMessage: reason
    }, req);
  }

  /**
   * Log logout
   */
  static async logLogout(user, req) {
    return this.log({
      action: 'LOGOUT',
      actorUserId: user._id,
      actorEmail: user.email,
      actorRole: user.role,
      entityType: 'USER',
      entityId: user._id,
      metadata: {
        email: user.email
      },
      status: 'SUCCESS'
    }, req);
  }

  /**
   * Log account lockout
   */
  static async logAccountLocked(user, failedAttempts, req) {
    return this.log({
      action: 'ACCOUNT_LOCKED',
      actorUserId: user._id,
      actorEmail: user.email,
      entityType: 'USER',
      entityId: user._id,
      entityName: `${user.firstName} ${user.lastName}`,
      metadata: {
        email: user.email,
        failedAttempts,
        reason: 'Too many failed login attempts'
      },
      status: 'WARNING'
    }, req);
  }

  // ============= COURSE EVENTS =============

  /**
   * Log course creation
   */
  static async logCourseCreated(course, req) {
    return this.log({
      action: 'COURSE_CREATED',
      entityType: 'COURSE',
      entityId: course._id,
      entityName: course.fullName || course.shortName,
      metadata: {
        courseId: course._id,
        shortName: course.shortName
      },
      status: 'SUCCESS'
    }, req);
  }

  /**
   * Log course update
   */
  static async logCourseUpdated(course, changes, req) {
    return this.log({
      action: 'COURSE_UPDATED',
      entityType: 'COURSE',
      entityId: course._id,
      entityName: course.fullName || course.shortName,
      metadata: {
        courseId: course._id,
        changes
      },
      status: 'SUCCESS'
    }, req);
  }

  /**
   * Log course enrollment
   */
  static async logCourseEnrolled(user, course, req) {
    return this.log({
      action: 'COURSE_ENROLLED',
      entityType: 'ENROLLMENT',
      metadata: {
        userId: user._id,
        userEmail: user.email,
        courseId: course._id,
        courseName: course.fullName || course.shortName
      },
      status: 'SUCCESS'
    }, req);
  }

  // ============= SECURITY EVENTS =============

  /**
   * Log suspicious activity
   */
  static async logSuspiciousActivity(description, req, userId = null) {
    return this.log({
      action: 'SUSPICIOUS_ACTIVITY',
      actorUserId: userId,
      entityType: 'SYSTEM',
      metadata: {
        description,
        timestamp: new Date()
      },
      status: 'WARNING'
    }, req);
  }

  /**
   * Log bulk import
   */
  static async logBulkImport(entityType, count, req) {
    return this.log({
      action: 'BULK_IMPORT',
      entityType: entityType.toUpperCase(),
      metadata: {
        count,
        timestamp: new Date()
      },
      status: 'SUCCESS'
    }, req);
  }
}

module.exports = AuditService;
