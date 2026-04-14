const Razorpay = require('razorpay');
const crypto = require('crypto');
const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');
const { sendNotification } = require('../services/notificationService');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/create-order
const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyerId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    if (order.razorpayOrderId) {
      return res.json({ razorpayOrderId: order.razorpayOrderId, amount: order.totalAmount });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100), // paise
      currency: 'INR',
      receipt: `order_${orderId}`,
      notes: { orderId, buyerId: order.buyerId, sellerId: order.sellerId },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    logger.error('createPaymentOrder error:', err);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

// POST /api/payments/verify
const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    // Verify signature
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        razorpayPaymentId,
        escrowStatus: 'HELD',
        status: 'CREATED', // Awaits contract signing
      },
      include: { seller: { select: { id: true, fullName: true } } },
    });

    await sendNotification({
      userId: order.buyerId,
      type: 'PAYMENT_RECEIVED',
      title: 'Payment successful',
      body: `₹${order.totalAmount.toLocaleString('en-IN')} is now held in escrow. Sign the contract to begin.`,
      data: { orderId },
    });

    await sendNotification({
      userId: order.sellerId,
      type: 'PAYMENT_RECEIVED',
      title: 'Buyer has paid!',
      body: `The buyer has made the payment. Please sign the contract to start.`,
      data: { orderId },
    });

    res.json({ message: 'Payment verified and funds held in escrow', order });
  } catch (err) {
    logger.error('verifyPayment error:', err);
    res.status(500).json({ error: 'Payment verification failed' });
  }
};

// POST /api/payments/webhook (Razorpay webhook)
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSig) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const { event, payload } = req.body;
    logger.info(`Razorpay webhook: ${event}`);

    if (event === 'payment.captured') {
      logger.info(`Payment captured: ${payload.payment.entity.id}`);
    }

    res.json({ received: true });
  } catch (err) {
    logger.error('webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// GET /api/payments/seller/balance
const getSellerBalance = async (req, res) => {
  try {
    const [released, pending] = await Promise.all([
      prisma.milestone.aggregate({
        where: {
          order: { sellerId: req.user.id },
          status: 'RELEASED',
          releasedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        _sum: { amount: true },
      }),
      prisma.milestone.aggregate({
        where: { order: { sellerId: req.user.id }, status: { in: ['PENDING', 'SUBMITTED'] } },
        _sum: { amount: true },
      }),
    ]);

    res.json({
      releasedThisMonth: released._sum.amount || 0,
      pendingEscrow: pending._sum.amount || 0,
    });
  } catch (err) {
    logger.error('getSellerBalance error:', err);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
};

module.exports = { createPaymentOrder, verifyPayment, handleWebhook, getSellerBalance };
