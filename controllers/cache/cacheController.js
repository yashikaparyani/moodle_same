// controllers/cache/cacheController.js - Cache Management Controller
const { CacheService } = require('../../services/cacheService');

/**
 * GET /api/cache/stats
 * Get cache statistics
 * @access Admin only
 */
exports.getCacheStats = async (req, res) => {
  try {
    const stats = await CacheService.getStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting cache statistics',
      error: error.message
    });
  }
};

/**
 * DELETE /api/cache/flush
 * Flush all cache (Admin only - use with caution!)
 * @access Admin only
 */
exports.flushCache = async (req, res) => {
  try {
    await CacheService.flushAll();

    res.json({
      success: true,
      message: 'All cache cleared successfully'
    });

  } catch (error) {
    console.error('Error flushing cache:', error);
    res.status(500).json({
      success: false,
      message: 'Error flushing cache',
      error: error.message
    });
  }
};

/**
 * DELETE /api/cache/:key
 * Delete specific cache key
 * @access Admin only
 */
exports.deleteCacheKey = async (req, res) => {
  try {
    const { key } = req.params;
    
    await CacheService.delete(key);

    res.json({
      success: true,
      message: `Cache key "${key}" deleted successfully`
    });

  } catch (error) {
    console.error('Error deleting cache key:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting cache key',
      error: error.message
    });
  }
};

/**
 * DELETE /api/cache/pattern/:pattern
 * Delete cache by pattern
 * @access Admin only
 */
exports.deleteCachePattern = async (req, res) => {
  try {
    const { pattern } = req.params;
    
    await CacheService.deletePattern(pattern);

    res.json({
      success: true,
      message: `Cache pattern "${pattern}" deleted successfully`
    });

  } catch (error) {
    console.error('Error deleting cache pattern:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting cache pattern',
      error: error.message
    });
  }
};

/**
 * POST /api/cache/invalidate
 * Invalidate cache by type (user, course, enrollment, etc.)
 * @access Admin, Manager
 */
exports.invalidateCache = async (req, res) => {
  try {
    const { type, id } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Cache type is required (user, course, enrollment, category, all)'
      });
    }

    await CacheService.invalidate(type, id);

    res.json({
      success: true,
      message: `Cache invalidated for type: ${type}${id ? ` (ID: ${id})` : ''}`
    });

  } catch (error) {
    console.error('Error invalidating cache:', error);
    res.status(500).json({
      success: false,
      message: 'Error invalidating cache',
      error: error.message
    });
  }
};

module.exports = exports;
