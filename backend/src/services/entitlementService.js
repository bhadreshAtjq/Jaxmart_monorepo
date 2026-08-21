const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

/**
 * Get full seller entitlement profile including plan limits, lead usage, and wallet balance
 */
const getSellerEntitlements = async (userId) => {
  try {
    let subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    // If no subscription exists, assign default Free plan
    if (!subscription) {
      const freePlan = await prisma.subscriptionPlan.findFirst({
        where: { slug: { in: ['free', 'basic'] }, isActive: true },
        orderBy: { displayOrder: 'asc' },
      });

      if (freePlan) {
        const now = new Date();
        subscription = await prisma.subscription.create({
          data: {
            userId,
            planId: freePlan.id,
            billingCycle: 'MONTHLY',
            status: 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
          },
          include: { plan: true },
        });
      }
    }

    const plan = subscription?.plan || {
      name: 'Free',
      slug: 'free',
      listingLimit: 5,
      leadQuotaPerCycle: 10,
      searchRankWeight: 0,
      hasVerifiedBadge: false,
      hasFeaturedPlacement: false,
      hasAnalytics: false,
      hasApiAccess: false,
      assuredDealFeeDiscountPct: 0,
      teamSeats: 1,
    };

    // Lead Credit Wallet
    let wallet = await prisma.leadCreditWallet.findUnique({
      where: { sellerId: userId },
    });

    if (!wallet) {
      wallet = await prisma.leadCreditWallet.create({
        data: { sellerId: userId, balance: 0 },
      });
    }

    // Calculate lead unlocks within current billing period
    const periodStart = subscription?.currentPeriodStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const periodEnd = subscription?.currentPeriodEnd || new Date();

    const usedQuotaCount = await prisma.leadUnlock.count({
      where: {
        sellerId: userId,
        unlockedVia: 'PLAN_QUOTA',
        unlockedAt: { gte: periodStart, lte: periodEnd },
      },
    });

    const activeListingsCount = await prisma.listing.count({
      where: {
        sellerId: userId,
        status: { in: ['ACTIVE', 'DRAFT', 'PAUSED'] },
      },
    });

    const isUnlimitedListings = (plan.listingLimit === -1 || plan.maxProducts === -1);
    const isUnlimitedLeads = (plan.leadQuotaPerCycle === -1);
    const leadQuota = plan.leadQuotaPerCycle ?? 10;
    const remainingQuota = isUnlimitedLeads ? 999999 : Math.max(0, leadQuota - usedQuotaCount);

    return {
      userId,
      subscription: {
        id: subscription?.id,
        status: subscription?.status,
        planName: plan.name,
        planSlug: plan.slug,
        billingCycle: subscription?.billingCycle,
        currentPeriodStart: subscription?.currentPeriodStart,
        currentPeriodEnd: subscription?.currentPeriodEnd,
      },
      plan: {
        name: plan.name,
        slug: plan.slug,
        listingLimit: isUnlimitedListings ? 'Unlimited' : plan.listingLimit,
        leadQuotaPerCycle: isUnlimitedLeads ? 'Unlimited' : leadQuota,
        searchRankWeight: plan.searchRankWeight,
        hasVerifiedBadge: plan.hasVerifiedBadge,
        hasFeaturedPlacement: plan.hasFeaturedPlacement,
        hasAnalytics: plan.hasAnalytics,
        hasApiAccess: plan.hasApiAccess,
        assuredDealFeeDiscountPct: plan.assuredDealFeeDiscountPct,
        teamSeats: plan.teamSeats,
      },
      usage: {
        activeListings: activeListingsCount,
        maxListings: isUnlimitedListings ? -1 : (plan.listingLimit ?? 5),
        canAddListing: isUnlimitedListings || activeListingsCount < (plan.listingLimit ?? 5),
        usedLeadQuota: usedQuotaCount,
        totalLeadQuota: isUnlimitedLeads ? -1 : leadQuota,
        remainingLeadQuota: remainingQuota,
        walletCredits: wallet.balance,
        totalAvailableLeads: isUnlimitedLeads ? 999999 : remainingQuota + wallet.balance,
      },
    };
  } catch (err) {
    logger.error('getSellerEntitlements error:', err);
    throw err;
  }
};

/**
 * Check if a seller can view full unmasked details for an RFQ lead
 */
const checkLeadAccess = async (sellerId, rfqId) => {
  try {
    // 1. Check if already unlocked
    const existingUnlock = await prisma.leadUnlock.findUnique({
      where: {
        sellerId_rfqId: { sellerId, rfqId },
      },
    });

    if (existingUnlock) {
      return { isUnlocked: true, unlockedVia: existingUnlock.unlockedVia, unlockedAt: existingUnlock.unlockedAt };
    }

    // 2. Check if seller submitted a quote on this RFQ
    const existingQuote = await prisma.rfqQuote.findFirst({
      where: { sellerId, rfqId },
    });

    if (existingQuote) {
      return { isUnlocked: true, unlockedVia: 'QUOTE_SUBMITTED', unlockedAt: existingQuote.submittedAt };
    }

    // 3. Check if seller has unlimited tier (Platinum)
    const subscription = await prisma.subscription.findUnique({
      where: { userId: sellerId },
      include: { plan: true },
    });

    if (subscription && subscription.status === 'ACTIVE' && subscription.plan.leadQuotaPerCycle === -1) {
      // Auto-create unlock for unlimited tier
      const unlock = await prisma.leadUnlock.create({
        data: {
          sellerId,
          rfqId,
          unlockedVia: 'UNLIMITED_TIER',
        },
      });
      return { isUnlocked: true, unlockedVia: 'UNLIMITED_TIER', unlockedAt: unlock.unlockedAt };
    }

    return { isUnlocked: false };
  } catch (err) {
    logger.error('checkLeadAccess error:', err);
    return { isUnlocked: false };
  }
};

/**
 * Unlock an RFQ lead by consuming included plan quota or wallet credit
 */
const unlockLead = async (sellerId, rfqId) => {
  try {
    // Check if already unlocked
    const existing = await prisma.leadUnlock.findUnique({
      where: { sellerId_rfqId: { sellerId, rfqId } },
    });

    if (existing) {
      return { success: true, message: 'Lead already unlocked', unlock: existing };
    }

    const entitlements = await getSellerEntitlements(sellerId);
    const { remainingLeadQuota, walletCredits } = entitlements.usage;
    const isUnlimited = entitlements.plan.leadQuotaPerCycle === 'Unlimited';

    return await prisma.$transaction(async (tx) => {
      let unlockMethod = 'PLAN_QUOTA';

      if (isUnlimited) {
        unlockMethod = 'UNLIMITED_TIER';
      } else if (remainingLeadQuota > 0) {
        unlockMethod = 'PLAN_QUOTA';
        // Increment used quota in subscription
        if (entitlements.subscription.id) {
          await tx.subscription.update({
            where: { id: entitlements.subscription.id },
            data: { usedLeadQuotaInCycle: { increment: 1 } },
          });
        }
      } else if (walletCredits > 0) {
        unlockMethod = 'CREDIT_WALLET';
        // Deduct 1 credit from wallet
        const wallet = await tx.leadCreditWallet.update({
          where: { sellerId },
          data: { balance: { decrement: 1 } },
        });

        // Record credit transaction
        await tx.leadCreditTransaction.create({
          data: {
            walletId: wallet.id,
            amount: -1,
            type: 'LEAD_UNLOCK',
            description: `Unlocked lead for RFQ #${rfqId.substring(0, 8)}`,
            referenceId: rfqId,
          },
        });
      } else {
        throw new Error('NO_LEAD_CREDITS');
      }

      const unlock = await tx.leadUnlock.create({
        data: {
          sellerId,
          rfqId,
          unlockedVia: unlockMethod,
        },
      });

      return {
        success: true,
        message: `Lead unlocked via ${unlockMethod.replace('_', ' ')}`,
        unlock,
        remainingPlanQuota: isUnlimited ? 'Unlimited' : Math.max(0, remainingLeadQuota - (unlockMethod === 'PLAN_QUOTA' ? 1 : 0)),
        remainingWalletCredits: walletCredits - (unlockMethod === 'CREDIT_WALLET' ? 1 : 0),
      };
    });
  } catch (err) {
    logger.error('unlockLead error:', err);
    throw err;
  }
};

/**
 * Calculate the Assured Deal platform fee percentage for a seller based on their subscription tier
 */
const getAssuredDealFee = async (sellerId, agreedAmount) => {
  try {
    const baseFeePct = 5.0; // 5% default base fee for Free plan

    const subscription = await prisma.subscription.findUnique({
      where: { userId: sellerId },
      include: { plan: true },
    });

    const discountPct = subscription?.plan?.assuredDealFeeDiscountPct || 0;
    // Apply tier discount (e.g. 10% discount off 5% = 4.5%, 25% off 5% = 3.75%, 40% off 5% = 3.0%)
    const effectiveFeePct = Number((baseFeePct * (1 - discountPct / 100)).toFixed(2));
    const feeAmount = Number(((agreedAmount * effectiveFeePct) / 100).toFixed(2));
    const sellerPayout = Number((agreedAmount - feeAmount).toFixed(2));

    return {
      baseFeePct,
      discountPct,
      effectiveFeePct,
      feeAmount,
      sellerPayout,
      tierName: subscription?.plan?.name || 'Free',
    };
  } catch (err) {
    logger.error('getAssuredDealFee error:', err);
    const feeAmount = Number(((agreedAmount * 5.0) / 100).toFixed(2));
    return {
      baseFeePct: 5.0,
      discountPct: 0,
      effectiveFeePct: 5.0,
      feeAmount,
      sellerPayout: Number((agreedAmount - feeAmount).toFixed(2)),
      tierName: 'Free',
    };
  }
};

module.exports = {
  getSellerEntitlements,
  checkLeadAccess,
  unlockLead,
  getAssuredDealFee,
};
