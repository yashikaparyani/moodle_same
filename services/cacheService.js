// services/cacheService.js - Cache Management Service
const { getRedisClient, isRedisConnected } = require('../config/redis');

/**
 * Default TTL (Time To Live) in seconds
 */
const DEFAULT_TTL = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 3600,          // 1 hour
  VERY_LONG: 86400     // 24 hours
};

class CacheService {
  
  /**
   * Set cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache (will be JSON stringified)
   * @param {number} ttl - Time to live in seconds (default: 5 minutes)
   */
  static async set(key, value, ttl = DEFAULT_TTL.MEDIUM) {
    try {
      const client = getRedisClient();
      if (!client) return false;

      const serializedValue = JSON.stringify(value);
      await client.setex(key, ttl, serializedValue);
      
      console.log(`✅ Cache SET: ${key} (TTL: ${ttl}s)`);
      return true;

    } catch (error) {
      console.error('Cache SET error:', error.message);
      return false;
    }
  }

  /**
   * Get cache by key
   * @param {string} key - Cache key
   * @returns {any} - Cached value or null
   */
  static async get(key) {
    try {
      const client = getRedisClient();
      if (!client) return null;

      const data = await client.get(key);
      
      if (data) {
        console.log(`✅ Cache HIT: ${key}`);
        return JSON.parse(data);
      }

      console.log(`❌ Cache MISS: ${key}`);
      return null;

    } catch (error) {
      console.error('Cache GET error:', error.message);
      return null;
    }
  }

  /**
   * Delete cache by key
   * @param {string} key - Cache key
   */
  static async delete(key) {
    try {
      const client = getRedisClient();
      if (!client) return false;

      await client.del(key);
      console.log(`🗑️ Cache DELETED: ${key}`);
      return true;

    } catch (error) {
      console.error('Cache DELETE error:', error.message);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   * @param {string} pattern - Key pattern (e.g., 'user:*')
   */
  static async deletePattern(pattern) {
    try {
      const client = getRedisClient();
      if (!client) return false;

      const keys = await client.keys(pattern);
      
      if (keys.length > 0) {
        await client.del(...keys);
        console.log(`🗑️ Cache DELETED: ${keys.length} keys matching "${pattern}"`);
      }

      return true;

    } catch (error) {
      console.error('Cache DELETE PATTERN error:', error.message);
      return false;
    }
  }

  /**
   * Check if key exists
   * @param {string} key - Cache key
   */
  static async exists(key) {
    try {
      const client = getRedisClient();
      if (!client) return false;

      const exists = await client.exists(key);
      return exists === 1;

    } catch (error) {
      console.error('Cache EXISTS error:', error.message);
      return false;
    }
  }

  /**
   * Get TTL of a key
   * @param {string} key - Cache key
   * @returns {number} - Remaining TTL in seconds (-1 if no expiry, -2 if key doesn't exist)
   */
  static async getTTL(key) {
    try {
      const client = getRedisClient();
      if (!client) return -2;

      return await client.ttl(key);

    } catch (error) {
      console.error('Cache TTL error:', error.message);
      return -2;
    }
  }

  /**
   * Flush all cache (use with caution!)
   */
  static async flushAll() {
    try {
      const client = getRedisClient();
      if (!client) return false;

      await client.flushall();
      console.log('🗑️ All cache FLUSHED');
      return true;

    } catch (error) {
      console.error('Cache FLUSH error:', error.message);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  static async getStats() {
    try {
      const client = getRedisClient();
      if (!client) {
        return {
          connected: false,
          message: 'Redis is not connected'
        };
      }

      const info = await client.info();
      const dbSize = await client.dbsize();

      return {
        connected: true,
        dbSize,
        info: info
      };

    } catch (error) {
      console.error('Cache STATS error:', error.message);
      return {
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Wrapper for caching database queries
   * Usage: 
   *   const data = await CacheService.remember('users:all', async () => {
   *     return await User.find();
   *   }, 300);
   * 
   * @param {string} key - Cache key
   * @param {Function} callback - Async function to execute if cache miss
   * @param {number} ttl - TTL in seconds
   */
  static async remember(key, callback, ttl = DEFAULT_TTL.MEDIUM) {
    try {
      // Check cache first
      const cached = await this.get(key);
      if (cached !== null) {
        return cached;
      }

      // Cache miss - execute callback
      console.log(`⚡ Executing query for: ${key}`);
      const result = await callback();

      // Store in cache
      await this.set(key, result, ttl);

      return result;

    } catch (error) {
      console.error('Cache REMEMBER error:', error.message);
      // If cache fails, still return the result
      return await callback();
    }
  }

  /**
   * Cache invalidation helper
   * Invalidate related caches when data changes
   */
  static async invalidate(type, id = null) {
    const patterns = {
      user: [`user:${id}`, `users:*`, `auth:${id}:*`],
      course: [`course:${id}`, `courses:*`, `enrollment:*`],
      enrollment: [`enrollment:*`, `user:*:courses`, `course:*:students`],
      category: [`category:*`, `categories:*`],
      all: ['*']
    };

    const keysToDelete = patterns[type] || [];

    for (const pattern of keysToDelete) {
      if (pattern.includes('*')) {
        await this.deletePattern(pattern);
      } else {
        await this.delete(pattern);
      }
    }
  }
}

// Export cache service and TTL constants
module.exports = {
  CacheService,
  CACHE_TTL: DEFAULT_TTL
};
