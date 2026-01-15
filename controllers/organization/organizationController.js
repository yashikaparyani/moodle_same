// controllers/organization/organizationController.js
const organizationService = require('../../services/organizationService');
const Organization = require('../../models/Organization');
const OrganizationToken = require('../../models/OrganizationToken');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const winston = require('winston');

// Create logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/organization-controller.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

/**
 * Generate organization token (Platform Admin only)
 * POST /api/v1/organizations/platform/tokens
 */
exports.generateToken = async (req, res) => {
  try {
    const { organizationName, email, maxUses, expiresInDays, metadata } = req.body;

    logger.info('Token generation requested', {
      organizationName,
      email,
      requestedBy: req.user._id
    });

    // Validation - both organizationName and email are required
    if (!organizationName || !email) {
      logger.warn('Token generation failed - missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Organization name and email are required'
      });
    }

    const expiryDays = expiresInDays || 7;

    const token = await organizationService.createToken(
      { 
        organizationName, 
        email, 
        expiryDays, 
        notes: metadata ? JSON.stringify(metadata) : '' 
      },
      req.user._id
    );

    logger.info('Token generated successfully', {
      tokenId: token._id,
      organizationName
    });

    res.status(201).json({
      success: true,
      message: 'Organization token generated successfully',
      token: {
        _id: token._id,
        token: token.token,
        organizationName: token.organizationName,
        maxUses: maxUses || 1,
        usedCount: 0,
        expiresAt: token.expiresAt,
        isActive: true,
        createdBy: token.createdBy,
        createdAt: token.createdAt,
        metadata: metadata || {}
      },
      registrationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?token=${token.token}`
    });
  } catch (error) {
    logger.error('Error generating token', {
      error: error.message,
      stack: error.stack,
      requestedBy: req.user?._id
    });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate token'
    });
  }
};

/**
 * Validate token (Public)
 * POST /api/v1/organizations/validate-token
 */
exports.validateToken = async (req, res) => {
  try {
    const { token } = req.body;

    logger.info('Token validation requested', {
      token: token ? token.substring(0, 10) + '...' : 'undefined'
    });

    if (!token) {
      logger.warn('Token validation failed - no token provided');
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }

    const orgToken = await organizationService.validateToken(token);

    logger.info('Token validated successfully', {
      tokenId: orgToken._id,
      organizationName: orgToken.organizationName
    });

    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        organizationName: orgToken.organizationName,
        email: orgToken.email,
        expiresAt: orgToken.expiresAt
      }
    });
  } catch (error) {
    logger.error('Token validation error', {
      error: error.message,
      token: req.body.token ? req.body.token.substring(0, 10) + '...' : 'undefined'
    });

    res.status(400).json({
      success: false,
      error: error.message || 'Token validation failed'
    });
  }
};

/**
 * Register organization (Public)
 * POST /api/v1/organizations/register
 */
exports.register = async (req, res) => {
  try {
    const { token, superAdmin, organization } = req.body;

    logger.info('Organization registration requested', {
      token: token ? token.substring(0, 10) + '...' : 'undefined',
      superAdminEmail: superAdmin?.email,
      organizationName: organization?.name
    });

    // Validation
    if (!token) {
      logger.warn('Registration failed - no token provided');
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }

    if (!superAdmin || !superAdmin.email || !superAdmin.password ||
        !superAdmin.firstName || !superAdmin.lastName) {
      logger.warn('Registration failed - incomplete super admin details');
      return res.status(400).json({
        success: false,
        error: 'Super admin details are incomplete (email, password, firstName, lastName required)'
      });
    }

    // Password validation
    if (superAdmin.password.length < 6) {
      logger.warn('Registration failed - weak password');
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Register organization
    const result = await organizationService.registerOrganization(
      token,
      superAdmin,
      organization || {}
    );

    // Generate JWT token
    const authToken = jwt.sign(
      {
        userId: result.superAdmin._id,
        email: result.superAdmin.email,
        role: result.superAdmin.role,
        organizationId: result.organization._id,
        isPlatformAdmin: false
      },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    logger.info('Organization registered successfully', {
      organizationId: result.organization._id,
      organizationName: result.organization.name,
      superAdminId: result.superAdmin._id,
      superAdminEmail: result.superAdmin.email
    });

    res.status(201).json({
      success: true,
      message: 'Organization registered successfully',
      data: {
        organization: {
          id: result.organization._id,
          name: result.organization.name,
          slug: result.organization.slug,
          email: result.organization.email
        },
        user: {
          id: result.superAdmin._id,
          firstName: result.superAdmin.firstName,
          lastName: result.superAdmin.lastName,
          email: result.superAdmin.email,
          role: result.superAdmin.role
        },
        token: authToken
      }
    });
  } catch (error) {
    logger.error('Organization registration error', {
      error: error.message,
      stack: error.stack,
      token: req.body.token ? req.body.token.substring(0, 10) + '...' : 'undefined'
    });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to register organization'
    });
  }
};

/**
 * Get my organization profile
 * GET /api/v1/organization/profile
 */
exports.getProfile = async (req, res) => {
  try {
    logger.info('Organization profile requested', {
      organizationId: req.organizationId,
      userId: req.user._id
    });

    if (!req.organizationId) {
      logger.warn('No organization context for profile request');
      return res.status(400).json({
        success: false,
        error: 'No organization context'
      });
    }

    const organization = await organizationService.getById(req.organizationId);

    logger.info('Organization profile fetched', {
      organizationId: organization._id,
      organizationName: organization.name
    });

    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    logger.error('Error fetching organization profile', {
      error: error.message,
      organizationId: req.organizationId,
      userId: req.user._id
    });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch organization profile'
    });
  }
};

/**
 * Update organization profile
 * PUT /api/v1/organization/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    logger.info('Organization profile update requested', {
      organizationId: req.organizationId,
      userId: req.user._id,
      updates: Object.keys(updates)
    });

    if (!req.organizationId) {
      logger.warn('No organization context for profile update');
      return res.status(400).json({
        success: false,
        error: 'No organization context'
      });
    }

    const organization = await organizationService.update(
      req.organizationId,
      updates
    );

    logger.info('Organization profile updated', {
      organizationId: organization._id,
      organizationName: organization.name,
      updatedBy: req.user._id
    });

    res.json({
      success: true,
      message: 'Organization profile updated successfully',
      data: organization
    });
  } catch (error) {
    logger.error('Error updating organization profile', {
      error: error.message,
      organizationId: req.organizationId,
      userId: req.user._id
    });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update organization profile'
    });
  }
};

/**
 * List all organizations (Platform Admin only)
 * GET /api/v1/organizations/platform/organizations
 */
exports.listAll = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    logger.info('List all organizations requested', {
      status,
      search,
      page,
      limit,
      requestedBy: req.user._id
    });

    const filters = {
      status,
      search,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    const organizations = await organizationService.listAll(filters);

    // Get total count
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const total = await Organization.countDocuments(query);

    logger.info('Organizations listed', {
      count: organizations.length,
      total,
      page,
      requestedBy: req.user._id
    });

    res.json({
      success: true,
      data: organizations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error listing organizations', {
      error: error.message,
      requestedBy: req.user?._id
    });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list organizations'
    });
  }
};

/**
 * Get organization by ID (Platform Admin only)
 * GET /api/v1/organizations/platform/organizations/:orgId
 */
exports.getById = async (req, res) => {
  try {
    const { orgId } = req.params;

    logger.info('Organization details requested', {
      orgId,
      requestedBy: req.user._id
    });

    const organization = await organizationService.getById(orgId);

    // Get user count
    const userCount = await User.countDocuments({ organizationId: orgId });

    logger.info('Organization details fetched', {
      organizationId: orgId,
      organizationName: organization.name,
      userCount
    });

    res.json({
      success: true,
      data: {
        ...organization.toObject(),
        userCount
      }
    });
  } catch (error) {
    logger.error('Error fetching organization details', {
      error: error.message,
      orgId: req.params.orgId,
      requestedBy: req.user._id
    });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch organization details'
    });
  }
};

/**
 * List all tokens (Platform Admin only)
 * GET /api/v1/organizations/platform/tokens
 */
exports.listTokens = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    logger.info('List tokens requested', {
      status,
      page,
      limit,
      requestedBy: req.user._id
    });

    const query = {};
    if (status) query.status = status;

    const tokens = await OrganizationToken.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('organizationId', 'name slug')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await OrganizationToken.countDocuments(query);

    logger.info('Tokens listed', {
      count: tokens.length,
      total,
      requestedBy: req.user._id
    });

    res.json({
      success: true,
      data: tokens,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error listing tokens', {
      error: error.message,
      requestedBy: req.user._id
    });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list tokens'
    });
  }
};

/**
 * Revoke token (Platform Admin only)
 * DELETE /api/v1/organizations/platform/tokens/:tokenId
 */
exports.revokeToken = async (req, res) => {
  try {
    const { tokenId } = req.params;

    logger.info('Token revocation requested', {
      tokenId,
      requestedBy: req.user._id
    });

    const token = await OrganizationToken.findById(tokenId);

    if (!token) {
      logger.warn('Token not found for revocation', { tokenId });
      return res.status(404).json({
        success: false,
        error: 'Token not found'
      });
    }

    await token.revoke('Revoked by platform admin');

    logger.info('Token revoked', {
      tokenId,
      revokedBy: req.user._id
    });

    res.json({
      success: true,
      message: 'Token revoked successfully'
    });
  } catch (error) {
    logger.error('Error revoking token', {
      error: error.message,
      tokenId: req.params.tokenId,
      requestedBy: req.user._id
    });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to revoke token'
    });
  }
};

module.exports = exports;
