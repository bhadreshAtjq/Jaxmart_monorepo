const express = require('express');
const router = express.Router();
const { authenticate, requireSeller } = require('../middleware/auth');
const {
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
} = require('../controllers/subscriptionController');

// Public routes
router.get('/plans', getPublicPlans);

// Authenticated user subscription routes
router.get('/me', authenticate, getMySubscription);
router.get('/entitlements', authenticate, getEntitlements);
router.post('/subscribe', authenticate, requireSeller, subscribe);
router.post('/verify-razorpay', authenticate, requireSeller, verifyRazorpaySubscription);

// Lead Credit Wallet & Unlocks
router.post('/credits/order', authenticate, requireSeller, createCreditOrder);
router.post('/credits/verify', authenticate, requireSeller, verifyCreditPurchase);
router.post('/unlock-lead/:rfqId', authenticate, requireSeller, unlockLeadEndpoint);

// Plan Lifecycle
router.post('/change-plan', authenticate, requireSeller, upgradeDowngradeSubscription);
router.post('/cancel', authenticate, requireSeller, cancelSubscription);
router.post('/manual-deposit', authenticate, requireSeller, submitDepositReceipt);
router.get('/invoices', authenticate, getMyInvoices);
router.get('/invoices/:id', authenticate, getInvoiceDetails);

module.exports = router;
