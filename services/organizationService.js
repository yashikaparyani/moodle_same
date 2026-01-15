// services/organizationService.js
const Organization = require('../models/Organization');
const OrganizationToken = require('../models/OrganizationToken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const winston = require('winston');

// Create logger for Organization service
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/organization-service.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

class OrganizationService {
  /**
   * Create a new organization token
   * @param {Object} data - Token data
   * @param {String} createdBy - User ID who created the token
   * @returns {Promise<Object>} Created token
   */
  async createToken(data, createdBy) {
    try {
      logger.info('Creating organization token', {
        organizationName: data.organizationName,
        email: data.email,
        createdBy
      });

      // Validate required fields
      if (!data.organizationName || !data.email) {
        throw new Error('Organization name and email are required');
      }

      // Check if email is already used for another organization
      const existingOrg = await Organization.findOne({ email: data.email });
      if (existingOrg) {
        logger.warn(`Attempted to create token for existing organization email: ${data.email}`);
        throw new Error('An organization with this email already exists');
      }

      // Check if there's an active token for this email
      const existingToken = await OrganizationToken.findOne({
        email: data.email,
        status: 'active',
        expiresAt: { $gt: new Date() }
      });

      if (existingToken) {
        logger.warn(`Active token already exists for email: ${data.email}`);
        throw new Error('An active token already exists for this email');
      }

      // Generate token
      const token = OrganizationToken.generateToken();
      
      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (data.expiryDays || 7));

      // Create token document
      const orgToken = new OrganizationToken({
        token,
        organizationName: data.organizationName,
        email: data.email,
        expiresAt,
        createdBy,
        notes: data.notes || ''
      });

      await orgToken.save();
      
      logger.info('Organization token created successfully', {
        tokenId: orgToken._id,
        organizationName: data.organizationName,
        expiresAt
      });

      return orgToken;
    } catch (error) {
      logger.error('Error creating organization token', {
        error: error.message,
        stack: error.stack,
        data
      });
      throw error;
    }
  }

  /**
   * Validate organization token
   * @param {String} token - Token string
   * @returns {Promise<Object>} Token document
   */
  async validateToken(token) {
    try {
      logger.info('Validating organization token', { 
        token: token.substring(0, 10) + '...' 
      });

      if (!token) {
        throw new Error('Token is required');
      }

      const orgToken = await OrganizationToken.findOne({ token });
      
      if (!orgToken) {
        logger.warn('Invalid token provided', { token: token.substring(0, 10) + '...' });
        throw new Error('Invalid token');
      }

      if (!orgToken.isValid()) {
        logger.warn('Token is not valid', {
          tokenId: orgToken._id,
          status: orgToken.status,
          isUsed: orgToken.isUsed,
          expiresAt: orgToken.expiresAt
        });
        throw new Error('Token is expired or already used');
      }

      logger.info('Token validated successfully', { tokenId: orgToken._id });
      return orgToken;
    } catch (error) {
      logger.error('Error validating token', {
        error: error.message,
        token: token ? token.substring(0, 10) + '...' : 'undefined'
      });
      throw error;
    }
  }

  /**
   * Register a new organization
   * @param {String} tokenString - Registration token
   * @param {Object} superAdminData - Super admin user data
   * @param {Object} organizationData - Organization data
   * @returns {Promise<Object>} Created organization and super admin
   */
  async registerOrganization(tokenString, superAdminData, organizationData) {
    try {
      logger.info('Registering new organization', {
        token: tokenString.substring(0, 10) + '...',
        superAdminEmail: superAdminData.email,
        organizationName: organizationData.name
      });

      // Validate token
      const token = await this.validateToken(tokenString);

      // Validate super admin data
      if (!superAdminData.email || !superAdminData.password || 
          !superAdminData.firstName || !superAdminData.lastName) {
        throw new Error('Super admin email, password, firstName, and lastName are required');
      }

      // Check if super admin email already exists
      const existingUser = await User.findOne({ email: superAdminData.email.toLowerCase() });
      if (existingUser) {
        logger.warn(`Email already registered: ${superAdminData.email}`);
        throw new Error('This email is already registered');
      }

      // Validate organization name
      const orgName = organizationData.name || token.organizationName;
      const existingOrgByName = await Organization.findOne({ 
        name: new RegExp(`^${orgName}$`, 'i') 
      });
      
      if (existingOrgByName) {
        logger.warn(`Organization name already exists: ${orgName}`);
        throw new Error('An organization with this name already exists');
      }

      // Create organization
      const organization = new Organization({
        name: orgName,
        slug: organizationData.slug, // Optional - will be auto-generated if not provided
        email: organizationData.email || token.email,
        phone: organizationData.phone,
        website: organizationData.website,
        description: organizationData.description,
        settings: organizationData.settings,
        branding: organizationData.branding
      });

      await organization.save();
      logger.info('Organization created', {
        organizationId: organization._id,
        name: organization.name,
        slug: organization.slug
      });

      // Hash password
      const hashedPassword = await bcrypt.hash(superAdminData.password, 10);
      
      // Create super admin user
      const superAdmin = new User({
        email: superAdminData.email.toLowerCase(),
        password: hashedPassword,
        firstName: superAdminData.firstName,
        lastName: superAdminData.lastName,
        role: 'admin',
        organizationId: organization._id,
        status: 'active',
        emailVerified: true,
        isPlatformAdmin: false
      });

      await superAdmin.save();
      logger.info('Super admin user created', {
        userId: superAdmin._id,
        email: superAdmin.email,
        organizationId: organization._id
      });

      // Link super admin to organization
      organization.superAdminId = superAdmin._id;
      await organization.save();

      // Mark token as used
      await token.markAsUsed(superAdmin._id, organization._id);

      logger.info('Organization registration completed successfully', {
        organizationId: organization._id,
        superAdminId: superAdmin._id,
        tokenId: token._id
      });

      return { organization, superAdmin };
    } catch (error) {
      logger.error('Error registering organization', {
        error: error.message,
        stack: error.stack,
        token: tokenString ? tokenString.substring(0, 10) + '...' : 'undefined'
      });
      throw error;
    }
  }

  /**
   * Get organization by ID
   * @param {String} id - Organization ID
   * @returns {Promise<Object>} Organization document
   */
  async getById(id) {
    try {
      logger.info('Fetching organization by ID', { id });

      if (!id) {
        throw new Error('Organization ID is required');
      }

      const organization = await Organization.findById(id)
        .populate('superAdminId', 'firstName lastName email phone');

      if (!organization) {
        logger.warn('Organization not found', { id });
        throw new Error('Organization not found');
      }

      logger.info('Organization fetched successfully', { 
        id, 
        name: organization.name 
      });

      return organization;
    } catch (error) {
      logger.error('Error fetching organization', {
        error: error.message,
        id
      });
      throw error;
    }
  }

  /**
   * Get organization by slug
   * @param {String} slug - Organization slug
   * @returns {Promise<Object>} Organization document
   */
  async getBySlug(slug) {
    try {
      logger.info('Fetching organization by slug', { slug });

      if (!slug) {
        throw new Error('Organization slug is required');
      }

      const organization = await Organization.findBySlug(slug);

      if (!organization) {
        logger.warn('Organization not found', { slug });
        throw new Error('Organization not found');
      }

      logger.info('Organization fetched successfully', { 
        slug, 
        name: organization.name 
      });

      return organization;
    } catch (error) {
      logger.error('Error fetching organization by slug', {
        error: error.message,
        slug
      });
      throw error;
    }
  }

  /**
   * Update organization
   * @param {String} id - Organization ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated organization
   */
  async update(id, updateData) {
    try {
      logger.info('Updating organization', { id, updateData });

      if (!id) {
        throw new Error('Organization ID is required');
      }

      const organization = await Organization.findById(id);
      
      if (!organization) {
        logger.warn('Organization not found for update', { id });
        throw new Error('Organization not found');
      }

      // Allowed fields for update
      const allowedFields = [
        'description', 'phone', 'website', 'branding', 
        'settings', 'status'
      ];

      // Update only allowed fields
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          if (typeof updateData[field] === 'object' && !Array.isArray(updateData[field])) {
            // Merge nested objects
            organization[field] = { ...organization[field], ...updateData[field] };
          } else {
            organization[field] = updateData[field];
          }
        }
      });

      await organization.save();

      logger.info('Organization updated successfully', { 
        id, 
        name: organization.name 
      });

      return organization;
    } catch (error) {
      logger.error('Error updating organization', {
        error: error.message,
        id,
        updateData
      });
      throw error;
    }
  }

  /**
   * Delete organization (soft delete)
   * @param {String} id - Organization ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      logger.info('Deleting organization', { id });

      if (!id) {
        throw new Error('Organization ID is required');
      }

      const organization = await Organization.findById(id);
      
      if (!organization) {
        logger.warn('Organization not found for deletion', { id });
        throw new Error('Organization not found');
      }

      // Check if organization can be deleted
      const canDelete = await organization.canBeDeleted();
      
      if (!canDelete) {
        logger.warn('Organization cannot be deleted - has users', { id });
        throw new Error('Cannot delete organization with existing users');
      }

      // Soft delete
      await organization.softDelete();

      logger.info('Organization deleted successfully', { 
        id, 
        name: organization.name 
      });
    } catch (error) {
      logger.error('Error deleting organization', {
        error: error.message,
        id
      });
      throw error;
    }
  }

  /**
   * List all organizations with filters
   * @param {Object} filters - Query filters
   * @returns {Promise<Array>} List of organizations
   */
  async listAll(filters = {}) {
    try {
      logger.info('Listing organizations', { filters });

      const query = {};
      
      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }

      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
          { slug: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const organizations = await Organization.find(query)
        .populate('superAdminId', 'firstName lastName email')
        .sort(filters.sort || { createdAt: -1 })
        .limit(filters.limit || 100)
        .skip(filters.skip || 0);

      logger.info(`Found ${organizations.length} organizations`, { filters });

      return organizations;
    } catch (error) {
      logger.error('Error listing organizations', {
        error: error.message,
        filters
      });
      throw error;
    }
  }
}

module.exports = new OrganizationService();
