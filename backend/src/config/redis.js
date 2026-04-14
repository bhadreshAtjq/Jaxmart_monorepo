const Redis = require('ioredis');
const { logger } = require('../utils/logger');

let isRedisConnected = false;

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryStrategy: (times) => {
    // Stop retrying quickly if it fails multiple times to avoid log spam
    if (times > 10) return null; 
    return Math.min(times * 100, 3000);
  },
  maxRetriesPerRequest: 1,
  lazyConnect: true, // Only connect when needed
  enableOfflineQueue: false, // Don't queue commands if disconnected
});

redis.on('connect', () => {
  if (!isRedisConnected) {
    logger.info('Cache Layer: Synchronized');
    isRedisConnected = true;
  }
});

redis.on('error', (err) => {
  if (isRedisConnected) {
    logger.error('Cache Layer: Signal Lost');
    isRedisConnected = false;
  }
  // Suppress further Error logs until reconnected to prevent Render Log Spam
});

const CACHE_TTL = {
  SHORT: 300,
  MEDIUM: 1800,
  LONG: 3600,
  DAY: 86400,
};

const cacheGet = async (key) => {
  if (!isRedisConnected) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const cacheSet = async (key, value, ttl = CACHE_TTL.MEDIUM) => {
  if (!isRedisConnected) return;
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch {
    // Fallback: Continue without cache
  }
};

const cacheDel = async (key) => {
  if (!isRedisConnected) return;
  try {
    await redis.del(key);
  } catch {
    // Fallback
  }
};

// Initial connection attempt
redis.connect().catch(() => {
  logger.warn('Cache Layer: Offline Mode Initialized (Proceeding with Direct DB Sourcing)');
});

module.exports = { redis, cacheGet, cacheSet, cacheDel, CACHE_TTL };
