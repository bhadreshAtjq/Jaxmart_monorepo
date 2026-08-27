const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getAnalytics,
  getKycQueue,
  approveKyc,
  rejectKyc,
  getListingQueue,
  approveListing,
  rejectListing,
  getUsers,
  getDisputes,
  resolveDispute,
  getAdminCaptains,
  createAdminCaptain,
  getAdminCaptainOnboardings,
  getAdminCaptainListings,
} = require('../controllers/adminController');
const {
  adminGetEvents,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const {
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
} = require('../controllers/adminSubscriptionController');
const {
  getAdminInvoices,
  getAdminRefunds,
  processAdminRefund,
  rejectAdminRefund,
} = require('../controllers/paymentController');

// All admin routes are protected
router.use(authenticate, requireAdmin);

router.get('/analytics', getAnalytics);
router.get('/stats', getAnalytics); // Alias for analytics
router.get('/kyc/queue', getKycQueue);
router.patch('/kyc/:userId/approve', approveKyc);
router.patch('/kyc/:userId/reject', rejectKyc);
router.get('/listings/queue', getListingQueue);
router.patch('/listings/:id/approve', approveListing);
router.patch('/listings/:id/reject', rejectListing);
router.get('/users', getUsers);
router.get('/disputes', getDisputes);
router.patch('/disputes/:id/resolve', resolveDispute);

// Admin Event Management
router.get('/events', adminGetEvents);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);

// Admin Subscription & Billing Management
router.get('/subscriptions/plans', getAllPlans);
router.post('/subscriptions/plans', createPlan);
router.put('/subscriptions/plans/:id', updatePlan);
router.delete('/subscriptions/plans/:id', deletePlan);
router.get('/subscriptions/subscribers', getSubscribers);
router.post('/subscriptions/subscribers/:userId/override', overrideUserSubscription);
router.get('/subscriptions/deposit-receipts', getPendingDepositReceipts);
router.post('/subscriptions/deposit-receipts/:id/verify', verifyDepositReceipt);
router.post('/subscriptions/deposit-receipts/:id/reject', rejectDepositReceipt);
router.get('/subscriptions/financial-report', getFinancialAnalytics);

// Admin Captain Field Operations Management
router.get('/captains', getAdminCaptains);
router.post('/captains', createAdminCaptain);
router.get('/captains/onboardings', getAdminCaptainOnboardings);
router.get('/captains/listings', getAdminCaptainListings);

// Admin Invoices & Refunds Management
router.get('/invoices', getAdminInvoices);
router.get('/refunds', getAdminRefunds);
router.post('/refunds/:orderId/process', processAdminRefund);
router.post('/refunds/:orderId/reject', rejectAdminRefund);

module.exports = router;

