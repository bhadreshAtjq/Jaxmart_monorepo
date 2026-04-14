const Redis = require('ioredis');
const { logger } = require('../utils/logger');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryStrategy: (times) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error('Redis error:', err));

const CACHE_TTL = {
  SHORT: 300,       // 5 minutes
  MEDIUM: 1800,     // 30 minutes
  LONG: 3600,       // 1 hour
  DAY: 86400,       // 24 hours
};

const cacheGet = async (key) => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

const cacheSet = async (key, value, ttl = CACHE_TTL.MEDIUM) => {
  await redis.setex(key, ttl, JSON.stringify(value));
};

const cacheDel = async (key) => {
  await redis.del(key);
};

module.exports = { redis, cacheGet, cacheSet, cacheDel, CACHE_TTL };
