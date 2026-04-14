const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

prisma.$connect()
  .then(() => logger.info('Database connected'))
  .catch((err) => {
    logger.error('Database connection failed:', err);
    process.exit(1);
  });

module.exports = { prisma };
