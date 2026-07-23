const express = require('express');
const router = express.Router();
const { authenticate, requireSeller } = require('../middleware/auth');
const {
  getPublicPlans,
  getMySubscription,
  subscribe,
  verifyRazorpaySubscription,
  upgradeDowngradeSubscription,
  cancelSubscription,
  submitDepositReceipt,
  getMyInvoices,
  getInvoiceDetails,
} = require('../controllers/subscriptionController');

// Public routes
router.get('/plans', getPublicPlans);

// Authenticated user subscription routes
router.get('/me', authenticate, getMySubscription);
router.post('/subscribe', authenticate, requireSeller, subscribe);
router.post('/verify-razorpay', authenticate, requireSeller, verifyRazorpaySubscription);
router.post('/change-plan', authenticate, requireSeller, upgradeDowngradeSubscription);
router.post('/cancel', authenticate, requireSeller, cancelSubscription);
router.post('/manual-deposit', authenticate, requireSeller, submitDepositReceipt);
router.get('/invoices', authenticate, getMyInvoices);
router.get('/invoices/:id', authenticate, getInvoiceDetails);

module.exports = router;
