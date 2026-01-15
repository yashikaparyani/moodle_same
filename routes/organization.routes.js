// routes/organization.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const {
  setOrganizationContext,
  requireOrganizationAdmin,
  requirePlatformAdmin
} = require('../middleware/organizationMiddleware');

const orgController = require('../controllers/organization/organizationController');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// Validate token (public)
router.post('/validate-token', orgController.validateToken);

// Register organization (public)
router.post('/register', orgController.register);

// ============================================
// PLATFORM ADMIN ROUTES
// ============================================

// Generate token (Platform Admin only)
router.post(
  '/platform/tokens',
  authenticate,
  requirePlatformAdmin,
  orgController.generateToken
);

// List all tokens (Platform Admin only)
router.get(
  '/platform/tokens',
  authenticate,
  requirePlatformAdmin,
  orgController.listTokens
);

// Revoke token (Platform Admin only)
router.delete(
  '/platform/tokens/:tokenId',
  authenticate,
  requirePlatformAdmin,
  orgController.revokeToken
);

// List all organizations (Platform Admin only)
router.get(
  '/platform/organizations',
  authenticate,
  requirePlatformAdmin,
  orgController.listAll
);

// Get organization by ID (Platform Admin only)
router.get(
  '/platform/organizations/:orgId',
  authenticate,
  requirePlatformAdmin,
  orgController.getById
);

// ============================================
// ORGANIZATION ROUTES (Authenticated users)
// ============================================

// All organization routes require authentication and organization context
router.use(authenticate, setOrganizationContext);

// Get my organization profile
router.get('/profile', orgController.getProfile);

// Update my organization profile (Admin only)
router.put('/profile', requireOrganizationAdmin, orgController.updateProfile);

module.exports = router;
