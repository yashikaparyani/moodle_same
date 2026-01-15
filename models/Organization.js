// models/Organization.js
const mongoose = require('mongoose');
const winston = require('winston');

// Create logger for Organization model
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/organization.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const organizationSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Organization name must be at least 2 characters'],
    maxlength: [200, 'Organization name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Organization email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9+\-\s()]*$/, 'Please provide a valid phone number']
  },
  website: {
    type: String,
    trim: true,
    match: [/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, 'Please provide a valid URL']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },

  // Status
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'suspended'],
      message: 'Status must be either active, inactive, or suspended'
    },
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Branding (Optional)
  branding: {
    logo: {
      type: String,
      trim: true
    },
    favicon: {
      type: String,
      trim: true
    },
    primaryColor: {
      type: String,
      default: '#007bff',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color code']
    },
    secondaryColor: {
      type: String,
      default: '#6c757d',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color code']
    },
    accentColor: {
      type: String,
      default: '#28a745',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color code']
    }
  },

  // Settings
  settings: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'hi', 'es', 'fr', 'de', 'ar', 'zh']
    },
    enabledModules: {
      type: [String],
      default: ['courses', 'users', 'assessments', 'reports']
    },
    features: {
      allowSelfRegistration: {
        type: Boolean,
        default: false
      },
      requireEmailVerification: {
        type: Boolean,
        default: true
      }
    }
  },

  // Super Admin Reference
  superAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
// Note: slug has unique: true in schema which automatically creates an index
organizationSchema.index({ status: 1 });
organizationSchema.index({ email: 1 });
organizationSchema.index({ createdAt: -1 });
organizationSchema.index({ name: 'text', description: 'text' });

// Pre-save middleware to generate slug and log
organizationSchema.pre('save', function() {
  // Generate slug from name if not provided
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
    
    logger.info(`Generated slug for organization: ${this.slug}`);
  }
  
  // Ensure slug doesn't contain invalid characters
  if (this.slug) {
    this.slug = this.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-|-$/g, '');
  }
});

// Pre-save validation to prevent duplicate slug
organizationSchema.pre('save', async function() {
  if (this.isModified('slug') || this.isNew) {
    const existingOrg = await this.constructor.findOne({
      slug: this.slug,
      _id: { $ne: this._id }
    });
    
    if (existingOrg) {
      const error = new Error(`Organization with slug '${this.slug}' already exists`);
      logger.error(`Duplicate slug attempted: ${this.slug}`);
      throw error;
    }
  }
});

// Post-save middleware for logging
organizationSchema.post('save', function(doc) {
  logger.info(`Organization saved: ${doc.name} (${doc._id})`);
});

// Post-remove middleware for logging
organizationSchema.post('remove', function(doc) {
  logger.info(`Organization removed: ${doc.name} (${doc._id})`);
});

// Static method to find by slug
organizationSchema.statics.findBySlug = function(slug) {
  logger.info(`Finding organization by slug: ${slug}`);
  return this.findOne({ slug, isActive: true });
};

// Static method to find active organizations
organizationSchema.statics.findActive = function(filters = {}) {
  logger.info('Finding active organizations', filters);
  return this.find({ ...filters, isActive: true, status: 'active' });
};

// Instance method to check if organization can be deleted
organizationSchema.methods.canBeDeleted = async function() {
  const User = mongoose.model('User');
  const userCount = await User.countDocuments({ organizationId: this._id });
  
  logger.info(`Checking if organization ${this.name} can be deleted. Users: ${userCount}`);
  return userCount === 0;
};

// Instance method to soft delete
organizationSchema.methods.softDelete = async function() {
  this.status = 'inactive';
  this.isActive = false;
  await this.save();
  logger.info(`Organization soft deleted: ${this.name} (${this._id})`);
};

// Error handling middleware
organizationSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    const message = `Organization with this ${field} already exists`;
    logger.error(`Duplicate key error: ${message}`, { field, value: error.keyValue[field] });
    next(new Error(message));
  } else {
    next(error);
  }
});

// Validation error handler
organizationSchema.post('validate', function(error, doc, next) {
  if (error) {
    logger.error('Organization validation error', { 
      organizationId: doc?._id, 
      errors: error.errors 
    });
  }
  next(error);
});

module.exports = mongoose.model('Organization', organizationSchema);
