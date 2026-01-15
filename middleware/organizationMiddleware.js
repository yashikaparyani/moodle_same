// middleware/organizationMiddleware.js
const Organization = require('../models/Organization');
const winston = require('winston');

// Create logger for Organization middleware
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/organization-middleware.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

/**
 * Set organization context from JWT token
 * Extracts organization information and attaches to request
 */
exports.setOrganizationContext = async (req, res, next) => {
  try {
    // Skip for public routes or if no user is authenticated
    if (!req.user) {
      logger.debug('No authenticated user - skipping organization context');
      return next();
    }

    logger.info('Setting organization context', {
      userId: req.user._id,
      userEmail: req.user.email,
      isPlatformAdmin: req.user.isPlatformAdmin
    });

    // Platform admin can target any organization
    if (req.user.isPlatformAdmin) {
      logger.info('Platform admin detected', { userId: req.user._id });
      
      // Check if targeting specific organization via header
      const targetOrgId = req.headers['x-organization-id'] || 
                          req.query.organizationId ||
                          req.body.organizationId;
      
      if (targetOrgId) {
        try {
          const organization = await Organization.findById(targetOrgId);
          
          if (!organization) {
            logger.warn('Target organization not found', { 
              targetOrgId, 
              userId: req.user._id 
            });
            return res.status(404).json({ 
              success: false,
              error: 'Organization not found' 
            });
          }

          req.organization = organization;
          req.organizationId = organization._id;
          
          logger.info('Platform admin targeting specific organization', {
            userId: req.user._id,
            organizationId: organization._id,
            organizationName: organization.name
          });
        } catch (error) {
          logger.error('Error fetching target organization', {
            error: error.message,
            targetOrgId,
            userId: req.user._id
          });
          return res.status(500).json({ 
            success: false,
            error: 'Failed to fetch organization' 
          });
        }
      }
      
      return next();
    }

    // Regular users: use their organization from token
    if (!req.user.organizationId) {
      logger.error('User has no organization context', {
        userId: req.user._id,
        userEmail: req.user.email
      });
      return res.status(403).json({ 
        success: false,
        error: 'No organization context. Please contact administrator.' 
      });
    }

    try {
      const organization = await Organization.findById(req.user.organizationId);
      
      if (!organization) {
        logger.error('Organization not found for user', {
          userId: req.user._id,
          organizationId: req.user.organizationId
        });
        return res.status(404).json({ 
          success: false,
          error: 'Organization not found' 
        });
      }

      if (!organization.isActive) {
        logger.warn('Organization is not active', {
          organizationId: organization._id,
          organizationName: organization.name,
          status: organization.status
        });
        return res.status(403).json({ 
          success: false,
          error: 'Organization is not active. Please contact support.',
          status: organization.status
        });
      }

      // Attach organization to request
      req.organization = organization;
      req.organizationId = organization._id;

      logger.info('Organization context set successfully', {
        userId: req.user._id,
        organizationId: organization._id,
        organizationName: organization.name
      });

      next();
    } catch (error) {
      logger.error('Error setting organization context', {
        error: error.message,
        stack: error.stack,
        userId: req.user._id,
        organizationId: req.user.organizationId
      });
      
      return res.status(500).json({ 
        success: false,
        error: 'Failed to set organization context' 
      });
    }
  } catch (error) {
    logger.error('Unexpected error in setOrganizationContext', {
      error: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

/**
 * Scope all queries to organization
 * Automatically adds organizationId to query parameters and body
 */
exports.scopeToOrganization = (req, res, next) => {
  try {
    // Skip if no organization context
    if (!req.organizationId) {
      logger.debug('No organization context - skipping scope');
      return next();
    }

    logger.info('Scoping request to organization', {
      organizationId: req.organizationId,
      method: req.method,
      path: req.path
    });

    // Add organizationId to query filters (for GET requests)
    if (req.query && typeof req.query === 'object') {
      // Don't override if already set (for platform admins)
      if (!req.query.organizationId) {
        req.query.organizationId = req.organizationId;
      }
    }

    // Add organizationId to body (for POST/PUT requests)
    if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
      // Don't override if already set
      if (!req.body.organizationId) {
        req.body.organizationId = req.organizationId;
      }
    }

    logger.debug('Request scoped to organization', {
      organizationId: req.organizationId,
      hasQueryOrg: !!req.query?.organizationId,
      hasBodyOrg: !!req.body?.organizationId
    });

    next();
  } catch (error) {
    logger.error('Error in scopeToOrganization', {
      error: error.message,
      stack: error.stack,
      organizationId: req.organizationId
    });
    
    return res.status(500).json({ 
      success: false,
      error: 'Failed to scope request to organization' 
    });
  }
};

/**
 * Require organization admin role
 * User must be organization super admin or have admin role
 */
exports.requireOrganizationAdmin = (req, res, next) => {
  try {
    logger.info('Checking organization admin access', {
      userId: req.user?._id,
      userRole: req.user?.role,
      isPlatformAdmin: req.user?.isPlatformAdmin,
      organizationId: req.organization?._id
    });

    if (!req.user) {
      logger.warn('No authenticated user for admin check');
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }

    // Platform admin has access to everything
    if (req.user.isPlatformAdmin) {
      logger.info('Platform admin access granted', { userId: req.user._id });
      return next();
    }

    // Check if user is organization super admin
    if (req.organization && 
        req.organization.superAdminId && 
        req.organization.superAdminId.toString() === req.user._id.toString()) {
      logger.info('Organization super admin access granted', {
        userId: req.user._id,
        organizationId: req.organization._id
      });
      return next();
    }

    // Check if user has admin role
    if (req.user.role === 'admin') {
      logger.info('Organization admin role access granted', {
        userId: req.user._id,
        role: req.user.role
      });
      return next();
    }

    logger.warn('Organization admin access denied', {
      userId: req.user._id,
      userRole: req.user.role,
      organizationId: req.organization?._id
    });

    return res.status(403).json({ 
      success: false,
      error: 'Organization admin access required' 
    });
  } catch (error) {
    logger.error('Error in requireOrganizationAdmin', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id
    });
    
    return res.status(500).json({ 
      success: false,
      error: 'Failed to verify admin access' 
    });
  }
};

/**
 * Require platform super admin
 * Only platform-level super admins can access
 */
exports.requirePlatformAdmin = (req, res, next) => {
  try {
    logger.info('Checking platform admin access', {
      userId: req.user?._id,
      isPlatformAdmin: req.user?.isPlatformAdmin
    });

    if (!req.user) {
      logger.warn('No authenticated user for platform admin check');
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }

    if (!req.user.isPlatformAdmin) {
      logger.warn('Platform admin access denied', {
        userId: req.user._id,
        userRole: req.user.role
      });
      
      return res.status(403).json({ 
        success: false,
        error: 'Platform admin access required' 
      });
    }

    logger.info('Platform admin access granted', { userId: req.user._id });
    next();
  } catch (error) {
    logger.error('Error in requirePlatformAdmin', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id
    });
    
    return res.status(500).json({ 
      success: false,
      error: 'Failed to verify platform admin access' 
    });
  }
};

/**
 * Verify organization ownership
 * Ensures user can only access their organization's data
 */
exports.verifyOrganizationOwnership = (resourceOrgIdField = 'organizationId') => {
  return async (req, res, next) => {
    try {
      logger.info('Verifying organization ownership', {
        userId: req.user?._id,
        userOrgId: req.organizationId,
        resourceOrgIdField
      });

      // Platform admin can access all
      if (req.user?.isPlatformAdmin) {
        logger.info('Platform admin - ownership check skipped', {
          userId: req.user._id
        });
        return next();
      }

      // Get resource organization ID from params, query, or body
      const resourceOrgId = req.params[resourceOrgIdField] || 
                           req.query[resourceOrgIdField] || 
                           req.body[resourceOrgIdField];

      if (!resourceOrgId) {
        logger.warn('No resource organization ID found', {
          userId: req.user?._id,
          field: resourceOrgIdField
        });
        return res.status(400).json({ 
          success: false,
          error: 'Resource organization ID not found' 
        });
      }

      if (!req.organizationId) {
        logger.error('User has no organization context', {
          userId: req.user?._id
        });
        return res.status(403).json({ 
          success: false,
          error: 'No organization context' 
        });
      }

      // Verify organization matches
      if (resourceOrgId.toString() !== req.organizationId.toString()) {
        logger.warn('Organization ownership verification failed', {
          userId: req.user._id,
          userOrgId: req.organizationId,
          resourceOrgId: resourceOrgId
        });
        
        return res.status(403).json({ 
          success: false,
          error: 'Access denied - resource belongs to different organization' 
        });
      }

      logger.info('Organization ownership verified', {
        userId: req.user._id,
        organizationId: req.organizationId
      });

      next();
    } catch (error) {
      logger.error('Error verifying organization ownership', {
        error: error.message,
        stack: error.stack,
        userId: req.user?._id
      });
      
      return res.status(500).json({ 
        success: false,
        error: 'Failed to verify organization ownership' 
      });
    }
  };
};

module.exports = exports;
