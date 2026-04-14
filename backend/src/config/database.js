const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

async function connectWithRetry() {
  const MAX_RETRIES = 5;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      await prisma.$connect();
      logger.info('Database connected successfully');
      return;
    } catch (err) {
      retries += 1;
      logger.error(`Database connection trial ${retries} failed:`, err.message);
      if (retries === MAX_RETRIES) {
        logger.error('Critical: Max DB connection retries reached. Platform suspended.');
        process.exit(1);
      }
      // Exponential backoff
      await new Promise(res => setTimeout(res, 2000 * retries));
    }
  }
}

connectWithRetry();

module.exports = { prisma };
