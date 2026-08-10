const Razorpay = require('razorpay');
const crypto = require('crypto');
const { logger } = require('../utils/logger');

let instance = null;

/**
 * Validates Razorpay environment credentials during application startup or service initialization.
 */
const validateRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    logger.error('CRITICAL: Razorpay credentials (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) must be set in environment variables!');
    return false;
  }

  if (keyId.includes('xxxx') || keySecret.includes('xxxx')) {
    logger.warn('WARNING: Razorpay credentials in process.env appear to be default placeholder values. Please set valid Razorpay Test Mode credentials in .env.');
  } else {
    logger.info(`Razorpay Service initialized using Key ID: ${keyId.substring(0, 8)}... (Test Mode)`);
  }

  return true;
};

/**
 * Get or initialize the singleton Razorpay instance.
 */
const getRazorpayInstance = () => {
  if (!instance) {
    validateRazorpayConfig();
    instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
    });
  }
  return instance;
};

/**
 * Creates an order on Razorpay servers.
 * @param {Object} params
 * @param {number} params.amount Amount in base unit (e.g. INR Rupees). Converted to paise integer.
 * @param {string} params.currency Default 'INR'
 * @param {string} params.receipt Unique receipt reference
 * @param {Object} params.notes Key-value metadata
 */
const createRazorpayOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
  try {
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error('Invalid payment amount. Amount must be greater than 0.');
    }

    const rzp = getRazorpayInstance();
    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: {
        platform: 'JaxMart',
        ...notes,
      },
    };

    const order = await rzp.orders.create(options);
    logger.info(`Razorpay order created successfully: ${order.id} for amount ${amount} ${currency}`);
    return order;
  } catch (err) {
    logger.error('Error creating Razorpay order:', err);
    throw err;
  }
};

/**
 * Verifies Razorpay Checkout signature using HMAC-SHA256 and constant-time string comparison.
 * @param {Object} params
 * @param {string} params.razorpayOrderId
 * @param {string} params.razorpayPaymentId
 * @param {string} params.razorpaySignature
 */
const verifyPaymentSignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    logger.warn('Signature verification failed: Missing required parameters');
    return false;
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    logger.error('Cannot verify signature: RAZORPAY_KEY_SECRET environment variable is missing');
    return false;
  }

  try {
    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
    const signatureBuf = Buffer.from(razorpaySignature, 'utf-8');

    if (expectedBuf.length !== signatureBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
  } catch (err) {
    logger.error('Error verifying payment signature:', err);
    return false;
  }
};

/**
 * Verifies Razorpay Webhook signature using HMAC-SHA256.
 * @param {string|Buffer} rawBody Raw body string or buffer from Express request
 * @param {string} signature Header x-razorpay-signature
 * @param {string} customSecret Optional webhook secret, falls back to process.env.RAZORPAY_WEBHOOK_SECRET or RAZORPAY_KEY_SECRET
 */
const verifyWebhookSignature = (rawBody, signature, customSecret = null) => {
  if (!rawBody || !signature) {
    return false;
  }

  const secret = customSecret || process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    logger.error('Webhook verification failed: Webhook secret not configured');
    return false;
  }

  try {
    const bodyStr = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf-8');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyStr)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
    const signatureBuf = Buffer.from(signature, 'utf-8');

    if (expectedBuf.length !== signatureBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
  } catch (err) {
    logger.error('Error verifying webhook signature:', err);
    return false;
  }
};

/**
 * Fetches detailed payment info from Razorpay REST API.
 * @param {string} razorpayPaymentId
 */
const fetchPaymentDetails = async (razorpayPaymentId) => {
  try {
    const rzp = getRazorpayInstance();
    return await rzp.payments.fetch(razorpayPaymentId);
  } catch (err) {
    logger.error(`Error fetching Razorpay payment details for ${razorpayPaymentId}:`, err);
    throw err;
  }
};

module.exports = {
  validateRazorpayConfig,
  getRazorpayInstance,
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  fetchPaymentDetails,
};
