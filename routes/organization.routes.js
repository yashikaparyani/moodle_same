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

/**
 * @swagger
 * /api/v1/organizations/validate-token:
 *   post:
 *     summary: Validate organization registration token
 *     description: Validate if an organization registration token is valid and not expired
 *     tags: [Organizations]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: "ORG-ABC123DEF456"
 *     responses:
 *       200:
 *         description: Token validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token is valid"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/validate-token', orgController.validateToken);

/**
 * @swagger
 * /api/v1/organizations/register:
 *   post:
 *     summary: Register new organization
 *     description: Register a new organization using a valid registration token
 *     tags: [Organizations]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - name
 *               - subdomain
 *               - contactEmail
 *             properties:
 *               token:
 *                 type: string
 *                 example: "ORG-ABC123DEF456"
 *               name:
 *                 type: string
 *                 example: "Tech University"
 *               subdomain:
 *                 type: string
 *                 example: "techuni"
 *               domain:
 *                 type: string
 *                 example: "techuniversity.edu"
 *               contactEmail:
 *                 type: string
 *                 format: email
 *                 example: "admin@techuniversity.edu"
 *     responses:
 *       201:
 *         description: Organization registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Organization registered successfully"
 *                 organization:
 *                   $ref: '#/components/schemas/Organization'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/register', orgController.register);

// ============================================
// PLATFORM ADMIN ROUTES
// ============================================

/**
 * @swagger
 * /api/v1/organizations/platform/tokens:
 *   post:
 *     summary: Generate organization registration token
 *     description: Generate a new token for organization registration (Platform Admin only)
 *     tags: [Organizations]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxUses:
 *                 type: integer
 *                 example: 1
 *               expiresInDays:
 *                 type: integer
 *                 example: 30
 *               notes:
 *                 type: string
 *                 example: "Token for Tech University"
 *     responses:
 *       201:
 *         description: Token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token generated successfully"
 *                 token:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     token:
 *                       type: string
 *                     maxUses:
 *                       type: integer
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/platform/tokens',
  authenticate,
  requirePlatformAdmin,
  orgController.generateToken
);

/**
 * @swagger
 * /api/v1/organizations/platform/tokens:
 *   get:
 *     summary: List all organization tokens
 *     description: Get all organization registration tokens (Platform Admin only)
 *     tags: [Organizations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, used, expired, revoked]
 *         description: Filter by token status
 *     responses:
 *       200:
 *         description: List of tokens retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 tokens:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/platform/tokens',
  authenticate,
  requirePlatformAdmin,
  orgController.listTokens
);

/**
 * @swagger
 * /api/v1/organizations/platform/tokens/{tokenId}:
 *   delete:
 *     summary: Revoke organization token
 *     description: Revoke an organization registration token (Platform Admin only)
 *     tags: [Organizations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *         description: Token ID to revoke
 *     responses:
 *       200:
 *         description: Token revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token revoked successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete(
  '/platform/tokens/:tokenId',
  authenticate,
  requirePlatformAdmin,
  orgController.revokeToken
);

/**
 * @swagger
 * /api/v1/organizations/platform/organizations:
 *   get:
 *     summary: List all organizations
 *     description: Get list of all organizations in the platform (Platform Admin only)
 *     tags: [Organizations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, suspended, trial]
 *         description: Filter by organization status
 *     responses:
 *       200:
 *         description: Organizations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 organizations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Organization'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/platform/organizations',
  authenticate,
  requirePlatformAdmin,
  orgController.listAll
);

/**
 * @swagger
 * /api/v1/organizations/platform/organizations/{orgId}:
 *   get:
 *     summary: Get organization by ID
 *     description: Get specific organization details by ID (Platform Admin only)
 *     tags: [Organizations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Organization retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 organization:
 *                   $ref: '#/components/schemas/Organization'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
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

/**
 * @swagger
 * /api/v1/organization/profile:
 *   get:
 *     summary: Get my organization profile
 *     description: Get the profile of the current user's organization
 *     tags: [Organizations]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Organization profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 organization:
 *                   $ref: '#/components/schemas/Organization'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/profile', orgController.getProfile);

/**
 * @swagger
 * /api/v1/organization/profile:
 *   put:
 *     summary: Update organization profile
 *     description: Update the current organization's profile (Organization Admin only)
 *     tags: [Organizations]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Tech University"
 *               domain:
 *                 type: string
 *                 example: "techuni.edu"
 *               contactEmail:
 *                 type: string
 *                 format: email
 *                 example: "contact@techuni.edu"
 *               settings:
 *                 type: object
 *     responses:
 *       200:
 *         description: Organization profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Organization updated successfully"
 *                 organization:
 *                   $ref: '#/components/schemas/Organization'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/profile', requireOrganizationAdmin, orgController.updateProfile);

module.exports = router;
