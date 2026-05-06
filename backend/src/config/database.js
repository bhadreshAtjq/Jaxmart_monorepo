const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: { db: { url: process.env.DATABASE_URL } },
});

// Advanced Resiliency Extension: Automatically retries transient cloud proxy errors
const prisma = basePrisma.$extends({
  query: {
    async $allOperations({ model, operation, args, query }) {
      let lastError;
      const MAX_RETRIES = 3;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          return await query(args);
        } catch (error) {
          lastError = error;
          // Retry on P1001 (Can't reach DB), P2024 (Pool Timeout), or P2028 (Transaction Expired)
          const isTransient = ['P1001', 'P2024', 'P2028'].includes(error.code);
          
          if (isTransient && attempt < MAX_RETRIES) {
            const delay = attempt * 500; // Fast retry: 500ms, 1000ms
            logger.warn(`Data Layer: Transient ${error.code} detected during ${operation}. Retrying in ${delay}ms... (Attempt ${attempt}/${MAX_RETRIES})`);
            await new Promise(r => setTimeout(r, delay));
            continue;
          }
          throw error;
        }
      }
      throw lastError;
    },
  },
});

async function connectWithRetry() {
  const MAX_RETRIES = 5;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      await basePrisma.$connect();
      logger.info('Database: Connection Active');
      return;
    } catch (err) {
      retries += 1;
      logger.error(`Database: Handshake ${retries} failed:`, err.message);
      if (retries === MAX_RETRIES) {
        logger.error('Database: Critical failure. System standby.');
        process.exit(1);
      }
      await new Promise(res => setTimeout(res, 2000 * retries));
    }
  }
}

connectWithRetry();

module.exports = { prisma };
