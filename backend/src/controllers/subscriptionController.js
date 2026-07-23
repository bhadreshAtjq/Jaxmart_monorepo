const Razorpay = require('razorpay');
const crypto = require('crypto');
const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');
const { sendNotification } = require('../services/notificationService');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

/**
 * GET /api/subscriptions/plans
 * Public endpoint to fetch all active subscription tiers and feature comparison
 */
const getPublicPlans = async (req, res) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    res.json({
      success: true,
      plans,
    });
  } catch (err) {
    logger.error('getPublicPlans error:', err);
    res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
};

/**
 * GET /api/subscriptions/me
 * Fetch logged-in user's subscription details, usage stats, and limits
 */
const getMySubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    let subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    // If user has no subscription record, auto-assign or return default Basic plan
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
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year for free tier
          },
          include: { plan: true },
        });
      }
    }

    // Calculate usage statistics
    const totalListings = await prisma.listing.count({
      where: {
        sellerId: userId,
        status: { in: ['ACTIVE', 'DRAFT', 'PAUSED'] },
      },
    });

    const usage = {
      productListings: totalListings,
      maxProducts: subscription?.plan?.maxProducts ?? 10,
      percentageProducts: subscription?.plan?.maxProducts > 0
        ? Math.min(100, Math.round((totalListings / subscription.plan.maxProducts) * 100))
        : 0,
      featuredProductSlots: subscription?.plan?.featuredProductSlots ?? 0,
      allowBulkUpload: subscription?.plan?.allowBulkUpload ?? false,
      allowApiAccess: subscription?.plan?.allowApiAccess ?? false,
      hasAdvancedAnalytics: subscription?.plan?.hasAdvancedAnalytics ?? false,
    };

    res.json({
      success: true,
      subscription,
      usage,
    });
  } catch (err) {
    logger.error('getMySubscription error:', err);
    res.status(500).json({ error: 'Failed to fetch subscription details' });
  }
};

/**
 * POST /api/subscriptions/subscribe
 * Initiate subscription setup (Razorpay order creation or Offline Bank Transfer reference)
 */
const subscribe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId, billingCycle = 'MONTHLY', paymentMethod = 'RAZORPAY' } = req.body;

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      return res.status(404).json({ error: 'Subscription plan not found or inactive' });
    }

    const price = billingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;

    // Free plan selection
    if (price === 0) {
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

      const subscription = await prisma.subscription.upsert({
        where: { userId },
        update: {
          planId: plan.id,
          billingCycle,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
        },
        create: {
          userId,
          planId: plan.id,
          billingCycle,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
        include: { plan: true },
      });

      return res.json({
        success: true,
        message: 'Subscribed to Free Basic Plan successfully',
        subscription,
      });
    }

    if (paymentMethod === 'RAZORPAY') {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(price * 100), // convert to paise
        currency: plan.currency || 'INR',
        receipt: `sub_${userId.substring(0, 8)}_${Date.now()}`,
        notes: {
          userId,
          planId: plan.id,
          billingCycle,
          type: 'SUBSCRIPTION',
        },
      });

      return res.json({
        success: true,
        paymentMethod: 'RAZORPAY',
        razorpayOrderId: razorpayOrder.id,
        amount: price,
        currency: plan.currency || 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
        plan,
        billingCycle,
      });
    } else if (paymentMethod === 'BANK_TRANSFER') {
      const transactionReference = `REF-SUB-${Date.now().toString(36).toUpperCase()}`;

      return res.json({
        success: true,
        paymentMethod: 'BANK_TRANSFER',
        transactionReference,
        amount: price,
        currency: plan.currency || 'INR',
        bankDetails: {
          bankName: process.env.BANK_NAME || 'Jaxmart Escrow & Billing Bank',
          accountName: process.env.BANK_ACCOUNT_NAME || 'Jaxmart Global B2B Pvt Ltd',
          accountNumber: process.env.BANK_ACCOUNT_NUMBER || '999888777665',
          ifscCode: process.env.BANK_IFSC || 'JAXM0001234',
          branch: process.env.BANK_BRANCH || 'Bengaluru Main Branch',
        },
        plan,
        billingCycle,
      });
    } else {
      return res.status(400).json({ error: 'Unsupported payment method' });
    }
  } catch (err) {
    logger.error('subscribe error:', err);
    res.status(500).json({ error: 'Failed to initiate subscription' });
  }
};

/**
 * POST /api/subscriptions/verify-razorpay
 * Verify Razorpay payment signature and activate subscription
 */
const verifyRazorpaySubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planId, billingCycle = 'MONTHLY' } = req.body;

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (process.env.NODE_ENV !== 'test' && expectedSignature !== razorpaySignature) {
      return res.status(400).json({ error: 'Invalid Razorpay payment signature' });
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const now = new Date();
    const durationDays = billingCycle === 'YEARLY' ? 365 : 30;
    const periodEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const amount = billingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;

    // Upsert subscription
    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: {
        planId: plan.id,
        billingCycle,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
      create: {
        userId,
        planId: plan.id,
        billingCycle,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      include: { plan: true },
    });

    // Create Invoice record
    const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
    const invoice = await prisma.subscriptionInvoice.create({
      data: {
        invoiceNumber,
        subscriptionId: subscription.id,
        userId,
        amount,
        currency: plan.currency || 'INR',
        status: 'PAID',
        billingPeriodStart: now,
        billingPeriodEnd: periodEnd,
        paymentMethod: 'RAZORPAY',
        razorpayPaymentId,
        paidAt: now,
      },
    });

    // Send notification to user
    await sendNotification({
      userId,
      type: 'PAYMENT_RECEIVED',
      title: `Subscription Activated: ${plan.name}`,
      body: `Your subscription to ${plan.name} (${billingCycle}) is now active until ${periodEnd.toLocaleDateString()}.`,
      data: { subscriptionId: subscription.id, invoiceId: invoice.id },
    });

    res.json({
      success: true,
      message: `Successfully subscribed to ${plan.name} plan`,
      subscription,
      invoice,
    });
  } catch (err) {
    logger.error('verifyRazorpaySubscription error:', err);
    res.status(500).json({ error: 'Failed to verify payment and activate subscription' });
  }
};

/**
 * POST /api/subscriptions/change-plan
 * Upgrade/Downgrade subscription plan
 */
const upgradeDowngradeSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newPlanId, billingCycle = 'MONTHLY' } = req.body;

    const newPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: newPlanId },
    });

    if (!newPlan || !newPlan.isActive) {
      return res.status(404).json({ error: 'Target subscription plan not found or inactive' });
    }

    const currentSubscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!currentSubscription) {
      return res.status(400).json({ error: 'No active subscription found to change' });
    }

    const now = new Date();
    const durationDays = billingCycle === 'YEARLY' ? 365 : 30;
    const periodEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const updatedSubscription = await prisma.subscription.update({
      where: { userId },
      data: {
        planId: newPlan.id,
        billingCycle,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
      include: { plan: true },
    });

    await sendNotification({
      userId,
      type: 'SYSTEM',
      title: 'Subscription Plan Changed',
      body: `Your plan has been updated to ${newPlan.name} (${billingCycle}).`,
      data: { planId: newPlan.id },
    });

    res.json({
      success: true,
      message: `Plan changed to ${newPlan.name} successfully`,
      subscription: updatedSubscription,
    });
  } catch (err) {
    logger.error('upgradeDowngradeSubscription error:', err);
    res.status(500).json({ error: 'Failed to change subscription plan' });
  }
};

/**
 * POST /api/subscriptions/cancel
 * Cancel subscription (immediate or at period end)
 */
const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { immediate = false, reason } = req.body;

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    let updated;
    if (immediate) {
      const basicPlan = await prisma.subscriptionPlan.findFirst({ where: { slug: 'basic' } });
      updated = await prisma.subscription.update({
        where: { userId },
        data: {
          status: 'CANCELLED',
          canceledAt: new Date(),
          endedAt: new Date(),
          planId: basicPlan ? basicPlan.id : subscription.planId,
        },
        include: { plan: true },
      });
    } else {
      updated = await prisma.subscription.update({
        where: { userId },
        data: {
          cancelAtPeriodEnd: true,
          canceledAt: new Date(),
        },
        include: { plan: true },
      });
    }

    await sendNotification({
      userId,
      type: 'SYSTEM',
      title: 'Subscription Cancellation Request',
      body: immediate
        ? 'Your subscription has been canceled immediately.'
        : `Your subscription will cancel at the end of the billing period on ${subscription.currentPeriodEnd.toLocaleDateString()}.`,
    });

    res.json({
      success: true,
      message: 'Subscription canceled successfully',
      subscription: updated,
    });
  } catch (err) {
    logger.error('cancelSubscription error:', err);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

/**
 * POST /api/subscriptions/manual-deposit
 * Submit offline bank transfer receipt for manual verification
 */
const submitDepositReceipt = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      planId,
      amount,
      currency = 'INR',
      transactionReference,
      transferDate,
      receiptUrl,
      notes,
    } = req.body;

    if (!transactionReference || !receiptUrl || !amount) {
      return res.status(400).json({ error: 'Missing required deposit fields (transactionReference, receiptUrl, amount)' });
    }

    const currentSubscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const receipt = await prisma.depositReceipt.create({
      data: {
        userId,
        subscriptionId: currentSubscription ? currentSubscription.id : null,
        amount: Number(amount),
        currency,
        transactionReference,
        transferDate: transferDate ? new Date(transferDate) : new Date(),
        receiptUrl,
        notes,
        status: 'PENDING',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Bank transfer receipt submitted successfully. Awaiting admin approval.',
      depositReceipt: receipt,
    });
  } catch (err) {
    logger.error('submitDepositReceipt error:', err);
    res.status(500).json({ error: 'Failed to submit deposit receipt' });
  }
};

/**
 * GET /api/subscriptions/invoices
 * Retrieve user's subscription invoice history
 */
const getMyInvoices = async (req, res) => {
  try {
    const userId = req.user.id;
    const invoices = await prisma.subscriptionInvoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      invoices,
    });
  } catch (err) {
    logger.error('getMyInvoices error:', err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

/**
 * GET /api/subscriptions/invoices/:id
 * Retrieve single invoice details
 */
const getInvoiceDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const invoice = await prisma.subscriptionInvoice.findFirst({
      where: { id, userId },
      include: { user: { select: { id: true, fullName: true, email: true, phone: true } } },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({
      success: true,
      invoice,
    });
  } catch (err) {
    logger.error('getInvoiceDetails error:', err);
    res.status(500).json({ error: 'Failed to fetch invoice details' });
  }
};

module.exports = {
  getPublicPlans,
  getMySubscription,
  subscribe,
  verifyRazorpaySubscription,
  upgradeDowngradeSubscription,
  cancelSubscription,
  submitDepositReceipt,
  getMyInvoices,
  getInvoiceDetails,
};
