const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');
const { sendNotification } = require('../services/notificationService');

/**
 * GET /api/admin/subscriptions/plans
 * List all subscription plans (including inactive ones)
 */
const getAllPlans = async (req, res) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    res.json({
      success: true,
      plans,
    });
  } catch (err) {
    logger.error('getAllPlans error:', err);
    res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
};

/**
 * POST /api/admin/subscriptions/plans
 * Create a new subscription plan
 */
const createPlan = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      monthlyPrice,
      yearlyPrice,
      currency = 'INR',
      maxProducts = 10,
      maxImagesPerProduct = 5,
      maxVideosPerProduct = 0,
      allowBulkUpload = false,
      allowApiAccess = false,
      verificationBadge = 'NONE',
      featuredProductSlots = 0,
      hasAdvancedAnalytics = false,
      hasCompetitorBenchmarking = false,
      supportLevel = 'EMAIL_ONLY',
      displayOrder = 0,
      razorpayPlanIdMonthly,
      razorpayPlanIdYearly,
      stripePriceIdMonthly,
      stripePriceIdYearly,
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    const newPlan = await prisma.subscriptionPlan.create({
      data: {
        name,
        slug: slug.toLowerCase(),
        description: description || '',
        monthlyPrice: Number(monthlyPrice) || 0,
        yearlyPrice: Number(yearlyPrice) || 0,
        currency,
        maxProducts: Number(maxProducts),
        maxImagesPerProduct: Number(maxImagesPerProduct),
        maxVideosPerProduct: Number(maxVideosPerProduct),
        allowBulkUpload: Boolean(allowBulkUpload),
        allowApiAccess: Boolean(allowApiAccess),
        verificationBadge,
        featuredProductSlots: Number(featuredProductSlots),
        hasAdvancedAnalytics: Boolean(hasAdvancedAnalytics),
        hasCompetitorBenchmarking: Boolean(hasCompetitorBenchmarking),
        supportLevel,
        displayOrder: Number(displayOrder),
        razorpayPlanIdMonthly,
        razorpayPlanIdYearly,
        stripePriceIdMonthly,
        stripePriceIdYearly,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully',
      plan: newPlan,
    });
  } catch (err) {
    logger.error('createPlan error:', err);
    res.status(500).json({ error: 'Failed to create subscription plan' });
  }
};

/**
 * PUT /api/admin/subscriptions/plans/:id
 * Update an existing subscription plan
 */
const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert numeric fields if present
    if (updateData.monthlyPrice !== undefined) updateData.monthlyPrice = Number(updateData.monthlyPrice);
    if (updateData.yearlyPrice !== undefined) updateData.yearlyPrice = Number(updateData.yearlyPrice);
    if (updateData.maxProducts !== undefined) updateData.maxProducts = Number(updateData.maxProducts);
    if (updateData.maxImagesPerProduct !== undefined) updateData.maxImagesPerProduct = Number(updateData.maxImagesPerProduct);
    if (updateData.maxVideosPerProduct !== undefined) updateData.maxVideosPerProduct = Number(updateData.maxVideosPerProduct);
    if (updateData.featuredProductSlots !== undefined) updateData.featuredProductSlots = Number(updateData.featuredProductSlots);
    if (updateData.displayOrder !== undefined) updateData.displayOrder = Number(updateData.displayOrder);

    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Subscription plan updated successfully',
      plan: updatedPlan,
    });
  } catch (err) {
    logger.error('updatePlan error:', err);
    res.status(500).json({ error: 'Failed to update subscription plan' });
  }
};

/**
 * DELETE /api/admin/subscriptions/plans/:id
 * Deactivate or soft-delete a plan
 */
const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Subscription plan deactivated successfully',
      plan,
    });
  } catch (err) {
    logger.error('deletePlan error:', err);
    res.status(500).json({ error: 'Failed to deactivate plan' });
  }
};

/**
 * GET /api/admin/subscriptions/subscribers
 * List user subscriptions with search & filtering
 */
const getSubscribers = async (req, res) => {
  try {
    const { status, planId, search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (status) where.status = status;
    if (planId) where.planId = planId;
    if (search) {
      where.user = {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      };
    }

    const [subscribers, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true, userType: true } },
          plan: true,
        },
      }),
      prisma.subscription.count({ where }),
    ]);

    res.json({
      success: true,
      subscribers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    logger.error('getSubscribers error:', err);
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
};

/**
 * POST /api/admin/subscriptions/subscribers/:userId/override
 * Admin manual grant or override of user subscription
 */
const overrideUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const { planId, billingCycle = 'MONTHLY', durationDays = 30, status = 'ACTIVE' } = req.body;

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    const now = new Date();
    const periodEnd = new Date(now.getTime() + Number(durationDays) * 24 * 60 * 60 * 1000);

    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: {
        planId: plan.id,
        billingCycle,
        status,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
      create: {
        userId,
        planId: plan.id,
        billingCycle,
        status,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      include: { plan: true },
    });

    await sendNotification({
      userId,
      type: 'SYSTEM',
      title: 'Subscription Updated by Administrator',
      body: `Your subscription has been updated to ${plan.name} until ${periodEnd.toLocaleDateString()}.`,
    });

    res.json({
      success: true,
      message: `Subscription for user updated to ${plan.name}`,
      subscription,
    });
  } catch (err) {
    logger.error('overrideUserSubscription error:', err);
    res.status(500).json({ error: 'Failed to override user subscription' });
  }
};

/**
 * GET /api/admin/subscriptions/deposit-receipts
 * Fetch queue of manual bank transfer receipts for admin review
 */
const getPendingDepositReceipts = async (req, res) => {
  try {
    const { status = 'PENDING', page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (status && status !== 'ALL') where.status = status;

    const [receipts, total] = await Promise.all([
      prisma.depositReceipt.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true } },
          subscription: { include: { plan: true } },
        },
      }),
      prisma.depositReceipt.count({ where }),
    ]);

    res.json({
      success: true,
      receipts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    logger.error('getPendingDepositReceipts error:', err);
    res.status(500).json({ error: 'Failed to fetch deposit receipts' });
  }
};

/**
 * POST /api/admin/subscriptions/deposit-receipts/:id/verify
 * Approve deposit receipt, set status to VERIFIED, activate subscription, create invoice
 */
const verifyDepositReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { targetPlanId, billingCycle = 'MONTHLY' } = req.body;

    const receipt = await prisma.depositReceipt.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!receipt) {
      return res.status(404).json({ error: 'Deposit receipt not found' });
    }

    if (receipt.status === 'VERIFIED') {
      return res.status(400).json({ error: 'Deposit receipt is already verified' });
    }

    let plan;
    if (targetPlanId) {
      plan = await prisma.subscriptionPlan.findUnique({ where: { id: targetPlanId } });
    } else {
      // Find plan with matching monthly/yearly price
      plan = await prisma.subscriptionPlan.findFirst({
        where: {
          OR: [
            { monthlyPrice: receipt.amount },
            { yearlyPrice: receipt.amount },
          ],
          isActive: true,
        },
      });
    }

    if (!plan) {
      plan = await prisma.subscriptionPlan.findFirst({ where: { slug: 'verified' } });
    }

    const now = new Date();
    const durationDays = billingCycle === 'YEARLY' ? 365 : 30;
    const periodEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // Update receipt status
    const updatedReceipt = await prisma.depositReceipt.update({
      where: { id },
      data: {
        status: 'VERIFIED',
        verifiedByUserId: adminId,
        verifiedAt: now,
      },
    });

    // Activate subscription
    const subscription = await prisma.subscription.upsert({
      where: { userId: receipt.userId },
      update: {
        planId: plan.id,
        billingCycle,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
      create: {
        userId: receipt.userId,
        planId: plan.id,
        billingCycle,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      include: { plan: true },
    });

    // Create Invoice
    const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
    const invoice = await prisma.subscriptionInvoice.create({
      data: {
        invoiceNumber,
        subscriptionId: subscription.id,
        userId: receipt.userId,
        amount: receipt.amount,
        currency: receipt.currency,
        status: 'PAID',
        billingPeriodStart: now,
        billingPeriodEnd: periodEnd,
        paymentMethod: 'BANK_TRANSFER',
        paidAt: now,
      },
    });

    await sendNotification({
      userId: receipt.userId,
      type: 'PAYMENT_RECEIVED',
      title: `Bank Deposit Verified - ${plan.name} Active`,
      body: `Your bank transfer deposit of ${receipt.currency} ${receipt.amount} has been verified by Admin. ${plan.name} subscription active until ${periodEnd.toLocaleDateString()}.`,
    });

    res.json({
      success: true,
      message: 'Deposit receipt verified and subscription activated successfully',
      depositReceipt: updatedReceipt,
      subscription,
      invoice,
    });
  } catch (err) {
    logger.error('verifyDepositReceipt error:', err);
    res.status(500).json({ error: 'Failed to verify deposit receipt' });
  }
};

/**
 * POST /api/admin/subscriptions/deposit-receipts/:id/reject
 * Reject deposit receipt with reason
 */
const rejectDepositReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const receipt = await prisma.depositReceipt.findUnique({
      where: { id },
    });

    if (!receipt) {
      return res.status(404).json({ error: 'Deposit receipt not found' });
    }

    const updatedReceipt = await prisma.depositReceipt.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason,
      },
    });

    await sendNotification({
      userId: receipt.userId,
      type: 'SYSTEM',
      title: 'Bank Deposit Receipt Rejected',
      body: `Your submitted deposit receipt (Ref: ${receipt.transactionReference}) was rejected. Reason: ${rejectionReason}`,
    });

    res.json({
      success: true,
      message: 'Deposit receipt rejected',
      depositReceipt: updatedReceipt,
    });
  } catch (err) {
    logger.error('rejectDepositReceipt error:', err);
    res.status(500).json({ error: 'Failed to reject deposit receipt' });
  }
};

/**
 * GET /api/admin/subscriptions/financial-report
 * Financial overview metrics (MRR, ARR, revenue, subscriber distribution)
 */
const getFinancialAnalytics = async (req, res) => {
  try {
    const [
      activeSubscriptionsCount,
      subscribersByPlan,
      totalInvoicesPaid,
      recentInvoices,
    ] = await Promise.all([
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.subscription.groupBy({
        by: ['planId'],
        _count: { userId: true },
        where: { status: 'ACTIVE' },
      }),
      prisma.subscriptionInvoice.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.subscriptionInvoice.findMany({
        where: { status: 'PAID' },
        take: 10,
        orderBy: { paidAt: 'desc' },
        include: { user: { select: { fullName: true, email: true } } },
      }),
    ]);

    // Map plan details to count
    const plans = await prisma.subscriptionPlan.findMany({ where: { isActive: true } });
    let estimatedMRR = 0;

    const breakdownByPlan = plans.map((plan) => {
      const match = subscribersByPlan.find((s) => s.planId === plan.id);
      const count = match ? match._count.userId : 0;
      estimatedMRR += count * plan.monthlyPrice;
      return {
        planId: plan.id,
        planName: plan.name,
        activeSubscribers: count,
        monthlyPrice: plan.monthlyPrice,
        estimatedRevenue: count * plan.monthlyPrice,
      };
    });

    res.json({
      success: true,
      metrics: {
        activeSubscribers: activeSubscriptionsCount,
        estimatedMRR,
        estimatedARR: estimatedMRR * 12,
        totalSubscriptionRevenuePaid: totalInvoicesPaid._sum.amount || 0,
        totalInvoicesPaidCount: totalInvoicesPaid._count.id || 0,
      },
      breakdownByPlan,
      recentInvoices,
    });
  } catch (err) {
    logger.error('getFinancialAnalytics error:', err);
    res.status(500).json({ error: 'Failed to fetch financial analytics' });
  }
};

module.exports = {
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getSubscribers,
  overrideUserSubscription,
  getPendingDepositReceipts,
  verifyDepositReceipt,
  rejectDepositReceipt,
  getFinancialAnalytics,
};
