const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  createRazorpayOrder,
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getPaymentHistory,
  getSellerBalance,
} = require('../controllers/paymentController');

// Public Webhook route (signature verified internally using rawBody)
router.post('/razorpay/webhook', handleWebhook);

// Protected routes (Authentication required)
router.use(authenticate);

// Razorpay Order Creation
router.post('/razorpay/order', createRazorpayOrder);
router.post('/create-order', createPaymentOrder);

// Payment Verification
router.post('/razorpay/verify', verifyPayment);
router.post('/verify', verifyPayment);

// Payment History & Balance
router.get('/history', getPaymentHistory);
router.get('/seller/balance', getSellerBalance);

module.exports = router;
