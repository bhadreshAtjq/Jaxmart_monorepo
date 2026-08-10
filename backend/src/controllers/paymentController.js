const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');
const { sendNotification } = require('../services/notificationService');
const razorpayService = require('../services/razorpayService');

/**
 * POST /api/payments/razorpay/order
 * Creates a Razorpay order for general or custom payment, records Payment entity in DB with status CREATED.
 */
const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { amount, currency = 'INR', orderId, notes = {}, description } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount. Amount must be a positive number.' });
    }

    let existingOrder = null;
    if (orderId) {
      existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
      if (!existingOrder) {
        return res.status(404).json({ success: false, error: 'Associated JaxMart order not found.' });
      }
      if (existingOrder.buyerId !== userId) {
        return res.status(403).json({ success: false, error: 'Not authorized to pay for this order.' });
      }
    }

    // Call dedicated Razorpay Service to create order on Razorpay servers
    const receipt = orderId ? `ord_${orderId.substring(0, 8)}_${Date.now()}` : `pay_${userId ? userId.substring(0, 8) : 'guest'}_${Date.now()}`;
    const razorpayOrder = await razorpayService.createRazorpayOrder({
      amount: parsedAmount,
      currency,
      receipt,
      notes: {
        userId: userId || 'anonymous',
        orderId: orderId || '',
        description: description || 'JaxMart B2B Payment',
        ...notes,
      },
    });

    // Record Payment in database with status CREATED
    const payment = await prisma.payment.create({
      data: {
        userId,
        orderId: orderId || null,
        amount: parsedAmount,
        currency: currency.toUpperCase(),
        status: 'CREATED',
        razorpayOrderId: razorpayOrder.id,
        metadata: {
          receipt: razorpayOrder.receipt,
          notes: razorpayOrder.notes,
          description: description || 'JaxMart Payment',
        },
      },
    });

    // If linked to an order, store razorpayOrderId on Order as well
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { razorpayOrderId: razorpayOrder.id },
      });
    }

    // Return safe public response only (NO SECRET EXPOSED)
    return res.status(201).json({
      success: true,
      paymentId: payment.id,
      orderId: razorpayOrder.id,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount: parsedAmount,
      currency: currency.toUpperCase(),
    });
  } catch (err) {
    logger.error('createRazorpayOrder error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to create Razorpay payment order' });
  }
};

/**
 * POST /api/payments/create-order (Legacy/Order-specific route alias)
 */
const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, error: 'orderId is required' });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    if (order.buyerId !== req.user.id) return res.status(403).json({ success: false, error: 'Not authorized' });

    // Check if existing payment created
    if (order.razorpayOrderId) {
      const existingPayment = await prisma.payment.findUnique({
        where: { razorpayOrderId: order.razorpayOrderId },
      });
      if (existingPayment && ['SUCCESS', 'PAID'].includes(existingPayment.status)) {
        return res.status(400).json({ success: false, error: 'Payment has already been completed for this order.' });
      }

      return res.json({
        success: true,
        orderId: order.razorpayOrderId,
        razorpayOrderId: order.razorpayOrderId,
        amount: order.totalAmount,
        currency: order.currency || 'INR',
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      });
    }

    req.body.amount = order.totalAmount;
    req.body.currency = order.currency || 'INR';
    return createRazorpayOrder(req, res);
  } catch (err) {
    logger.error('createPaymentOrder error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create payment order' });
  }
};

/**
 * POST /api/payments/razorpay/verify
 * Verifies Razorpay checkout HMAC signature, updates DB payment state idempotently.
 */
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpayOrderId: altOrderId,
      razorpayPaymentId: altPaymentId,
      razorpaySignature: altSignature,
      orderId,
    } = req.body;

    const rzpOrderId = razorpay_order_id || altOrderId;
    const rzpPaymentId = razorpay_payment_id || altPaymentId;
    const rzpSignature = razorpay_signature || altSignature;

    if (!rzpOrderId || !rzpPaymentId || !rzpSignature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment verification details (razorpay_order_id, razorpay_payment_id, razorpay_signature)',
      });
    }

    // Perform server-side HMAC signature verification
    const isValidSignature = razorpayService.verifyPaymentSignature({
      razorpayOrderId: rzpOrderId,
      razorpayPaymentId: rzpPaymentId,
      razorpaySignature: rzpSignature,
    });

    if (!isValidSignature) {
      logger.warn(`Invalid Razorpay signature submitted for order ${rzpOrderId}`);

      // Mark payment as FAILED if payment record exists
      await prisma.payment.updateMany({
        where: { razorpayOrderId: rzpOrderId, status: { notIn: ['SUCCESS', 'PAID'] } },
        data: {
          status: 'FAILED',
          failureReason: 'Signature verification failed',
          failedAt: new Date(),
        },
      });

      return res.status(400).json({ success: false, error: 'Invalid payment signature. Verification failed.' });
    }

    // Idempotency check: find existing payment record
    let payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: rzpOrderId },
    });

    if (payment && ['SUCCESS', 'PAID'].includes(payment.status)) {
      logger.info(`Payment ${rzpOrderId} already verified and processed.`);
      return res.json({
        success: true,
        message: 'Payment verified (already processed)',
        status: payment.status,
        razorpayPaymentId: payment.razorpayPaymentId,
      });
    }

    // Update payment record in database
    if (payment) {
      payment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId: rzpPaymentId,
          signature: rzpSignature,
          status: 'SUCCESS',
          paidAt: new Date(),
        },
      });
    } else {
      payment = await prisma.payment.create({
        data: {
          userId: req.user?.id || null,
          orderId: orderId || null,
          amount: 0, // Will be updated if order is found
          currency: 'INR',
          status: 'SUCCESS',
          razorpayOrderId: rzpOrderId,
          razorpayPaymentId: rzpPaymentId,
          signature: rzpSignature,
          paidAt: new Date(),
        },
      });
    }

    // Update linked JaxMart Order if present
    const targetOrderId = orderId || payment.orderId;
    let order = null;

    if (targetOrderId) {
      order = await prisma.order.update({
        where: { id: targetOrderId },
        data: {
          razorpayPaymentId: rzpPaymentId,
          razorpayOrderId: rzpOrderId,
          paymentStatus: 'PAID',
          escrowStatus: 'HELD',
          status: 'CREATED',
          paidAt: new Date(),
        },
        include: {
          buyer: { select: { id: true, fullName: true, email: true } },
          seller: { select: { id: true, fullName: true, email: true } },
        },
      });

      if (payment.amount === 0 && order.totalAmount) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { amount: order.totalAmount, currency: order.currency || 'INR' },
        });
      }

      // Send notifications to buyer and seller
      if (order.buyerId) {
        await sendNotification({
          userId: order.buyerId,
          type: 'PAYMENT_RECEIVED',
          title: 'Payment Successful',
          body: `Your payment of ₹${order.totalAmount.toLocaleString('en-IN')} for Order #${order.id.slice(0, 8)} is verified and held safely in escrow.`,
          data: { orderId: order.id },
        }).catch((err) => logger.error('Error sending buyer notification:', err));
      }

      if (order.sellerId) {
        await sendNotification({
          userId: order.sellerId,
          type: 'PAYMENT_RECEIVED',
          title: 'Buyer Payment Confirmed',
          body: `Payment of ₹${order.totalAmount.toLocaleString('en-IN')} has been received and is held in escrow. Please proceed with order execution.`,
          data: { orderId: order.id },
        }).catch((err) => logger.error('Error sending seller notification:', err));
      }
    }

    logger.info(`Payment successfully verified on server for Razorpay Order: ${rzpOrderId}`);
    return res.json({
      success: true,
      message: 'Payment verified and server-side validation complete.',
      paymentId: payment.id,
      razorpayOrderId: rzpOrderId,
      razorpayPaymentId: rzpPaymentId,
      status: 'SUCCESS',
      order: order ? { id: order.id, status: order.status, escrowStatus: order.escrowStatus } : null,
    });
  } catch (err) {
    logger.error('verifyPayment error:', err);
    return res.status(500).json({ success: false, error: 'Server error during payment verification' });
  }
};

/**
 * POST /api/payments/razorpay/webhook
 * Handles Razorpay webhook events with signature verification and idempotent processing.
 */
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      logger.warn('Webhook request rejected: missing x-razorpay-signature header');
      return res.status(400).json({ success: false, error: 'Missing x-razorpay-signature header' });
    }

    // Get raw body captured by express.json verify middleware or stringify body
    const rawBody = req.rawBody ? req.rawBody : JSON.stringify(req.body);

    const isValidWebhook = razorpayService.verifyWebhookSignature(rawBody, signature);
    if (!isValidWebhook) {
      logger.warn('Invalid Razorpay webhook signature received');
      return res.status(400).json({ success: false, error: 'Invalid webhook signature' });
    }

    const { event, payload } = req.body;
    logger.info(`Received Razorpay webhook event: ${event}`);

    // Process event idempotently
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment?.entity;
      const orderEntity = payload.order?.entity;

      const rzpOrderId = paymentEntity?.order_id || orderEntity?.id;
      const rzpPaymentId = paymentEntity?.id;
      const amountInRupees = paymentEntity?.amount ? paymentEntity.amount / 100 : 0;
      const paymentMethod = paymentEntity?.method || 'online';

      if (rzpOrderId) {
        let existingPayment = await prisma.payment.findUnique({
          where: { razorpayOrderId: rzpOrderId },
        });

        if (existingPayment && ['SUCCESS', 'PAID'].includes(existingPayment.status)) {
          logger.info(`Webhook idempotent skip: Payment ${rzpOrderId} already marked SUCCESS.`);
        } else {
          if (existingPayment) {
            await prisma.payment.update({
              where: { id: existingPayment.id },
              data: {
                status: 'SUCCESS',
                razorpayPaymentId: rzpPaymentId || existingPayment.razorpayPaymentId,
                paymentMethod,
                paidAt: new Date(),
                gatewayResponse: paymentEntity || orderEntity,
              },
            });
          } else {
            await prisma.payment.create({
              data: {
                amount: amountInRupees,
                currency: paymentEntity?.currency || 'INR',
                status: 'SUCCESS',
                razorpayOrderId: rzpOrderId,
                razorpayPaymentId: rzpPaymentId,
                paymentMethod,
                paidAt: new Date(),
                gatewayResponse: paymentEntity || orderEntity,
              },
            });
          }

          // Update JaxMart order if found
          const order = await prisma.order.findFirst({
            where: { razorpayOrderId: rzpOrderId },
          });

          if (order && order.paymentStatus !== 'PAID') {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: 'PAID',
                escrowStatus: 'HELD',
                razorpayPaymentId: rzpPaymentId || order.razorpayPaymentId,
                paidAt: new Date(),
              },
            });
          }
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;
      const rzpPaymentId = paymentEntity?.id;
      const errorDesc = paymentEntity?.error_description || paymentEntity?.error_reason || 'Payment failed';

      if (rzpOrderId) {
        await prisma.payment.upsert({
          where: { razorpayOrderId: rzpOrderId },
          update: {
            status: 'FAILED',
            razorpayPaymentId: rzpPaymentId,
            failureReason: errorDesc,
            failedAt: new Date(),
            gatewayResponse: paymentEntity,
          },
          create: {
            amount: paymentEntity?.amount ? paymentEntity.amount / 100 : 0,
            currency: paymentEntity?.currency || 'INR',
            status: 'FAILED',
            razorpayOrderId: rzpOrderId,
            razorpayPaymentId: rzpPaymentId,
            failureReason: errorDesc,
            failedAt: new Date(),
            gatewayResponse: paymentEntity,
          },
        });
      }
    } else if (event === 'refund.processed' || event === 'refund.created') {
      const refundEntity = payload.refund?.entity;
      const rzpPaymentId = refundEntity?.payment_id;

      if (rzpPaymentId) {
        const payment = await prisma.payment.findUnique({
          where: { razorpayPaymentId: rzpPaymentId },
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'REFUNDED',
              metadata: {
                ...(typeof payment.metadata === 'object' ? payment.metadata : {}),
                refund: refundEntity,
              },
            },
          });
        }
      }
    }

    return res.status(200).json({ success: true, received: true });
  } catch (err) {
    logger.error('handleWebhook error:', err);
    return res.status(500).json({ success: false, error: 'Webhook processing failed' });
  }
};

/**
 * GET /api/payments/history
 * Fetch payment records for authenticated user.
 */
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        order: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
          },
        },
      },
    });

    return res.json({ success: true, payments });
  } catch (err) {
    logger.error('getPaymentHistory error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch payment history' });
  }
};

/**
 * GET /api/payments/seller/balance
 */
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

    return res.json({
      success: true,
      releasedThisMonth: released._sum.amount || 0,
      pendingEscrow: pending._sum.amount || 0,
    });
  } catch (err) {
    logger.error('getSellerBalance error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch balance' });
  }
};

module.exports = {
  createRazorpayOrder,
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getPaymentHistory,
  getSellerBalance,
};
