const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

/**
 * Middleware to check if seller has exceeded product listing limit for their subscription tier
 */
const checkProductLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch user subscription with plan
    let subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    // If no subscription record, auto-assign basic plan
    if (!subscription) {
      const basicPlan = await prisma.subscriptionPlan.findFirst({
        where: { slug: 'basic' },
      });

      if (basicPlan) {
        subscription = await prisma.subscription.create({
          data: {
            userId,
            planId: basicPlan.id,
            billingCycle: 'MONTHLY',
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
          include: { plan: true },
        });
      }
    }

    const plan = subscription?.plan;
    const maxProducts = plan?.maxProducts ?? 10;

    // -1 signifies unlimited products (e.g., Assessed Enterprise tier)
    if (maxProducts === -1) {
      return next();
    }

    // Count existing active/draft listings for seller
    const currentListingsCount = await prisma.listing.count({
      where: {
        sellerId: userId,
        status: { in: ['ACTIVE', 'DRAFT', 'PAUSED'] },
      },
    });

    if (currentListingsCount >= maxProducts) {
      return res.status(403).json({
        error: `Subscription limit reached. Your current ${plan?.name || 'Basic'} tier allows a maximum of ${maxProducts} products. Please upgrade your subscription to add more products.`,
        code: 'SUBSCRIPTION_LIMIT_REACHED',
        currentCount: currentListingsCount,
        maxLimit: maxProducts,
      });
    }

    next();
  } catch (err) {
    logger.error('checkProductLimit middleware error:', err);
    // Continue on error so service is not blocked, but log error
    next();
  }
};

module.exports = { checkProductLimit };
