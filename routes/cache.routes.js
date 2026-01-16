// routes/cache.routes.js - Cache Management Routes
const express = require('express');
const router = express.Router();

const cacheController = require('../controllers/cache/cacheController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

/**
 * @swagger
 * /api/cache/stats:
 *   get:
 *     summary: Get cache statistics
 *     description: Get Redis cache statistics and metrics - Admin only
 *     tags: [Cache]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cache statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalKeys:
 *                       type: integer
 *                       example: 150
 *                     memoryUsage:
 *                       type: string
 *                       example: "2.5 MB"
 *                     hitRate:
 *                       type: number
 *                       example: 85.5
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/stats',
  authenticate,
  authorize('admin'),
  cacheController.getCacheStats
);

/**
 * @swagger
 * /api/cache/flush:
 *   delete:
 *     summary: Flush all cache
 *     description: Delete all cached data (use with caution!) - Admin only
 *     tags: [Cache]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cache flushed successfully
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
 *                   example: "Cache flushed successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete(
  '/flush',
  authenticate,
  authorize('admin'),
  cacheController.flushCache
);

/**
 * @swagger
 * /api/cache/{key}:
 *   delete:
 *     summary: Delete specific cache key
 *     description: Delete a specific key from cache - Admin only
 *     tags: [Cache]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Cache key to delete
 *         example: "courses:all"
 *     responses:
 *       200:
 *         description: Cache key deleted successfully
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
 *                   example: "Cache key deleted successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete(
  '/:key',
  authenticate,
  authorize('admin'),
  cacheController.deleteCacheKey
);

/**
 * @swagger
 * /api/cache/pattern/{pattern}:
 *   delete:
 *     summary: Delete cache by pattern
 *     description: Delete all cache keys matching a pattern - Admin only
 *     tags: [Cache]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pattern
 *         required: true
 *         schema:
 *           type: string
 *         description: Cache key pattern (supports wildcards)
 *         example: "courses:*"
 *     responses:
 *       200:
 *         description: Cache pattern deleted successfully
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
 *                   example: "Cache pattern deleted successfully"
 *                 deletedCount:
 *                   type: integer
 *                   example: 15
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete(
  '/pattern/:pattern',
  authenticate,
  authorize('admin'),
  cacheController.deleteCachePattern
);

/**
 * @swagger
 * /api/cache/invalidate:
 *   post:
 *     summary: Invalidate cache by type
 *     description: Invalidate cache for specific resource types - Admin/Manager only
 *     tags: [Cache]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [courses, users, categories, organizations]
 *                 example: "courses"
 *     responses:
 *       200:
 *         description: Cache invalidated successfully
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
 *                   example: "Cache invalidated successfully"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/invalidate',
  authenticate,
  authorize('admin', 'manager'),
  cacheController.invalidateCache
);

module.exports = router;
