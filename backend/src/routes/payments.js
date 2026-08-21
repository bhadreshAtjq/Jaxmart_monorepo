const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  createPaymentOrder,
  verifyPayment,
  getUserInvoices,
  getInvoiceById,
  getUserPurchases,
  requestRefund,
  getUserRefunds,
} = require('../controllers/paymentController');

// All payment & invoice routes require authentication
router.post('/create-order', authenticate, createPaymentOrder);
router.post('/verify', authenticate, verifyPayment);
router.get('/invoices', authenticate, getUserInvoices);
router.get('/invoices/:id', authenticate, getInvoiceById);
router.get('/purchases', authenticate, getUserPurchases);
router.post('/orders/:orderId/request-refund', authenticate, requestRefund);
router.get('/refunds', authenticate, getUserRefunds);

module.exports = router;
