const Razorpay = require('razorpay');
const crypto = require('crypto');
const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');
const { sendNotification } = require('../services/notificationService');
const { getSellerEntitlements, unlockLead } = require('../services/entitlementService');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// Credit packs pricing configuration
const LEAD_CREDIT_PACKS = [
  { id: 'pack_10', credits: 10, price: 499, pricePerLead: 49.9, discount: '0%' },
  { id: 'pack_50', credits: 50, price: 1999, pricePerLead: 39.9, discount: '20% OFF' },
  { id: 'pack_100', credits: 100, price: 3499, pricePerLead: 34.9, discount: '30% OFF' },
  { id: 'pack_250', credits: 250, price: 6999, pricePerLead: 27.9, discount: '44% OFF' },
];

/**
 * GET /api/subscriptions/plans
 * Public endpoint returning all active subscription tiers and feature comparison
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
      creditPacks: LEAD_CREDIT_PACKS,
    });
  } catch (err) {
    logger.error('getPublicPlans error:', err);
    res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
};

/**
 * GET /api/subscriptions/me
 * Fetch logged-in user's subscription details, quota usage, wallet, and entitlements
 */
const getMySubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const entitlements = await getSellerEntitlements(userId);
    res.json({
      success: true,
      ...entitlements,
    });
  } catch (err) {
    logger.error('getMySubscription error:', err);
    res.status(500).json({ error: 'Failed to fetch subscription details' });
  }
};

/**
 * GET /api/subscriptions/entitlements
 * Alias for getMySubscription
 */
const getEntitlements = async (req, res) => {
  return getMySubscription(req, res);
};

/**
 * POST /api/subscriptions/subscribe
 * Create Razorpay order for subscription plan
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

    // Free plan activation (₹0)
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
          usedLeadQuotaInCycle: 0,
        },
        create: {
          userId,
          planId: plan.id,
          billingCycle,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          usedLeadQuotaInCycle: 0,
        },
        include: { plan: true },
      });

      return res.json({
        success: true,
        message: 'Subscribed to Free Plan successfully',
        subscription,
      });
    }

    if (paymentMethod === 'RAZORPAY') {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(price * 100), // paise
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
          bankName: process.env.BANK_NAME || 'Jaxmart Escrow & Nodal Bank',
          accountName: process.env.BANK_ACCOUNT_NAME || 'JaxMart India B2B Pvt Ltd',
          accountNumber: process.env.BANK_ACCOUNT_NUMBER || '999888777665',
          ifscCode: process.env.BANK_IFSC || 'JAXM0001234',
          branch: process.env.BANK_BRANCH || 'Bengaluru Main Corporate Branch',
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
 * Verify Razorpay payment signature, activate subscription, create invoice
 */
const verifyRazorpaySubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planId, billingCycle = 'MONTHLY' } = req.body;

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
      .update(body)
      .digest('hex');

    if (process.env.NODE_ENV === 'production' && expectedSignature !== razorpaySignature) {
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
        usedLeadQuotaInCycle: 0,
      },
      create: {
        userId,
        planId: plan.id,
        billingCycle,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        usedLeadQuotaInCycle: 0,
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

    // Initialize/Ensure Lead Credit Wallet exists
    await prisma.leadCreditWallet.upsert({
      where: { sellerId: userId },
      update: {},
      create: { sellerId: userId, balance: 0 },
    });

    // Send notification to user
    await sendNotification({
      userId,
      type: 'PAYMENT_RECEIVED',
      title: `Subscription Activated: ${plan.name}`,
      body: `Your subscription to ${plan.name} (${billingCycle}) is now active until ${periodEnd.toLocaleDateString('en-IN')}.`,
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
 * POST /api/subscriptions/credits/order
 * Create Razorpay order to purchase top-up lead credits
 */
const createCreditOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { packId } = req.body;

    const pack = LEAD_CREDIT_PACKS.find(p => p.id === packId);
    if (!pack) {
      return res.status(400).json({ error: 'Invalid credit pack selected' });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(pack.price * 100), // paise
      currency: 'INR',
      receipt: `cred_${userId.substring(0, 8)}_${Date.now()}`,
      notes: {
        userId,
        packId: pack.id,
        credits: String(pack.credits),
        type: 'LEAD_CREDITS',
      },
    });

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: pack.price,
      currency: 'INR',
      credits: pack.credits,
      pack,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    logger.error('createCreditOrder error:', err);
    res.status(500).json({ error: 'Failed to create credit purchase order' });
  }
};

/**
 * POST /api/subscriptions/credits/verify
 * Verify Razorpay payment and credit the seller's wallet
 */
const verifyCreditPurchase = async (req, res) => {
  try {
    const userId = req.user.id;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, packId } = req.body;

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
      .update(body)
      .digest('hex');

    if (process.env.NODE_ENV === 'production' && expectedSignature !== razorpaySignature) {
      return res.status(400).json({ error: 'Invalid Razorpay payment signature' });
    }

    const pack = LEAD_CREDIT_PACKS.find(p => p.id === packId);
    if (!pack) {
      return res.status(400).json({ error: 'Invalid credit pack' });
    }

    const updatedWallet = await prisma.$transaction(async (tx) => {
      const wallet = await tx.leadCreditWallet.upsert({
        where: { sellerId: userId },
        update: { balance: { increment: pack.credits } },
        create: { sellerId: userId, balance: pack.credits },
      });

      await tx.leadCreditTransaction.create({
        data: {
          walletId: wallet.id,
          amount: pack.credits,
          type: 'PURCHASE',
          description: `Purchased ${pack.credits} Lead Unlock Credits`,
          referenceId: razorpayPaymentId,
        },
      });

      return wallet;
    });

    await sendNotification({
      userId,
      type: 'PAYMENT_RECEIVED',
      title: 'Lead Credits Added!',
      body: `Successfully added ${pack.credits} lead unlock credits to your wallet. Current Balance: ${updatedWallet.balance} credits.`,
      data: { walletId: updatedWallet.id, credits: pack.credits },
    });

    res.json({
      success: true,
      message: `${pack.credits} credits added successfully`,
      balance: updatedWallet.balance,
    });
  } catch (err) {
    logger.error('verifyCreditPurchase error:', err);
    res.status(500).json({ error: 'Failed to verify credit purchase' });
  }
};

/**
 * POST /api/subscriptions/unlock-lead/:rfqId
 * Unlock an RFQ lead using plan quota or wallet credit
 */
const unlockLeadEndpoint = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { rfqId } = req.params;

    const result = await unlockLead(sellerId, rfqId);
    res.json(result);
  } catch (err) {
    if (err.message === 'NO_LEAD_CREDITS') {
      return res.status(403).json({
        error: 'Lead quota exhausted and zero wallet credits remaining. Please upgrade plan or buy lead credits.',
        code: 'QUOTA_EXHAUSTED',
      });
    }
    logger.error('unlockLeadEndpoint error:', err);
    res.status(500).json({ error: 'Failed to unlock lead' });
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
        usedLeadQuotaInCycle: 0,
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
 * Cancel subscription (at period end or immediate)
 */
const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { immediate = false } = req.body;

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    let updated;
    if (immediate) {
      const freePlan = await prisma.subscriptionPlan.findFirst({ where: { slug: { in: ['free', 'basic'] } } });
      updated = await prisma.subscription.update({
        where: { userId },
        data: {
          status: 'CANCELLED',
          canceledAt: new Date(),
          endedAt: new Date(),
          planId: freePlan ? freePlan.id : subscription.planId,
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
        ? 'Your subscription has been canceled.'
        : `Your subscription will cancel at the end of the billing period on ${subscription.currentPeriodEnd.toLocaleDateString('en-IN')}.`,
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
 * Submit offline bank transfer receipt
 */
const submitDepositReceipt = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
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
      message: 'Bank transfer receipt submitted successfully. Awaiting admin verification.',
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
  getEntitlements,
  subscribe,
  verifyRazorpaySubscription,
  createCreditOrder,
  verifyCreditPurchase,
  unlockLeadEndpoint,
  upgradeDowngradeSubscription,
  cancelSubscription,
  submitDepositReceipt,
  getMyInvoices,
  getInvoiceDetails,
};
