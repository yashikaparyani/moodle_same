// scripts/createPlatformAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Organization = require('../models/Organization');
const winston = require('winston');
require('dotenv').config();

// Create logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console()
  ]
});

async function createPlatformAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Connected to MongoDB');

    // Check if platform organization exists
    let platformOrg = await Organization.findOne({ slug: 'platform' });

    if (!platformOrg) {
      // Create platform organization
      platformOrg = new Organization({
        name: 'Platform',
        slug: 'platform',
        email: 'platform@yourdomain.com',
        description: 'Platform administration organization',
        status: 'active',
        isActive: true
      });

      await platformOrg.save();
      logger.info('✅ Platform organization created');
      logger.info(`   Organization ID: ${platformOrg._id}`);
    } else {
      logger.info('✓ Platform organization already exists');
      logger.info(`   Organization ID: ${platformOrg._id}`);
    }

    // Check if platform admin already exists
    const existingAdmin = await User.findOne({
      email: 'admin@yourdomain.com',
      isPlatformAdmin: true
    });

    if (existingAdmin) {
      logger.info('❌ Platform admin already exists');
      logger.info(`   Email: ${existingAdmin.email}`);
      logger.info(`   User ID: ${existingAdmin._id}`);
      logger.info('\n💡 To reset password, delete this user and run script again.');
      
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create platform super admin
    const password = process.env.PLATFORM_ADMIN_PASSWORD || 'Admin@123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const platformAdmin = new User({
      email: 'admin@yourdomain.com',
      password: hashedPassword,
      firstName: 'Platform',
      lastName: 'Admin',
      role: 'admin',
      organizationId: platformOrg._id,
      isPlatformAdmin: true,
      status: 'active',
      emailVerified: true
    });

    await platformAdmin.save();

    logger.info('\n✅ Platform admin created successfully!');
    logger.info('='.repeat(50));
    logger.info('📧 Email: admin@yourdomain.com');
    logger.info(`🔑 Password: ${password}`);
    logger.info(`👤 User ID: ${platformAdmin._id}`);
    logger.info(`🏢 Organization ID: ${platformOrg._id}`);
    logger.info('='.repeat(50));
    logger.info('\n⚠️  IMPORTANT: Change the default password immediately!');
    logger.info('⚠️  Set PLATFORM_ADMIN_PASSWORD in .env for custom password\n');

    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error creating platform admin:');
    logger.error(error.message);
    logger.error(error.stack);
    
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
logger.info('\n🚀 Starting Platform Admin Creation Script...\n');
createPlatformAdmin();
