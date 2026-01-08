// config/redis.js - Redis Configuration
const Redis = require('ioredis');

let redisClient = null;
let isConnected = false;

/**
 * Initialize Redis Connection
 */
const connectRedis = async () => {
  try {
    // Redis Configuration
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        // Stop retrying after 3 attempts
        if (times > 3) {
          console.log('⚠️ Redis connection failed. Server will run without caching.');
          return null; // Stop retrying
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      lazyConnect: true // Don't connect immediately
    };

    redisClient = new Redis(redisConfig);

    // Connection Events
    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
      isConnected = true;
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis is ready to use');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
      isConnected = false;
    });

    redisClient.on('close', () => {
      console.log('⚠️ Redis connection closed');
      isConnected = false;
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });

    // Try to connect
    try {
      await redisClient.connect();
      await redisClient.ping();
      return redisClient;
    } catch (connectError) {
      // Connection failed - disable reconnection attempts
      if (redisClient) {
        redisClient.disconnect();
      }
      throw connectError;
    }

  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    console.log('⚠️ Server will continue without Redis caching');
    console.log('💡 To enable caching, install and start Redis server');
    isConnected = false;
    redisClient = null; // Clear client reference
    return null;
  }
};

/**
 * Get Redis Client
 */
const getRedisClient = () => {
  if (!isConnected || !redisClient) {
    console.warn('⚠️ Redis is not connected. Skipping cache operation.');
    return null;
  }
  return redisClient;
};

/**
 * Check if Redis is connected
 */
const isRedisConnected = () => {
  return isConnected;
};

/**
 * Close Redis Connection
 */
const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    console.log('✅ Redis connection closed gracefully');
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  isRedisConnected,
  closeRedis
};
