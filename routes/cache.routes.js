// routes/cache.routes.js - Cache Management Routes
const express = require('express');
const router = express.Router();

const cacheController = require('../controllers/cache/cacheController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

/**
 * @route   GET /api/cache/stats
 * @desc    Get cache statistics
 * @access  Admin only
 */
router.get(
  '/stats',
  authenticate,
  authorize('admin'),
  cacheController.getCacheStats
);

/**
 * @route   DELETE /api/cache/flush
 * @desc    Flush all cache (use with caution!)
 * @access  Admin only
 */
router.delete(
  '/flush',
  authenticate,
  authorize('admin'),
  cacheController.flushCache
);

/**
 * @route   DELETE /api/cache/:key
 * @desc    Delete specific cache key
 * @access  Admin only
 */
router.delete(
  '/:key',
  authenticate,
  authorize('admin'),
  cacheController.deleteCacheKey
);

/**
 * @route   DELETE /api/cache/pattern/:pattern
 * @desc    Delete cache by pattern
 * @access  Admin only
 */
router.delete(
  '/pattern/:pattern',
  authenticate,
  authorize('admin'),
  cacheController.deleteCachePattern
);

/**
 * @route   POST /api/cache/invalidate
 * @desc    Invalidate cache by type
 * @access  Admin, Manager
 */
router.post(
  '/invalidate',
  authenticate,
  authorize('admin', 'manager'),
  cacheController.invalidateCache
);

module.exports = router;
