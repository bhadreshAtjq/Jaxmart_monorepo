const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getAnalytics,
  getKycQueue,
  approveKyc,
  getListingQueue,
  getUsers,
  getDisputes,
  resolveDispute
} = require('../controllers/adminController');

// All admin routes are protected
router.use(authenticate, requireAdmin);

router.get('/analytics', getAnalytics);
router.get('/stats', getAnalytics); // Alias for analytics
router.get('/kyc/queue', getKycQueue);
router.patch('/kyc/:userId/approve', approveKyc);
router.patch('/kyc/:userId/reject', (req, res) => res.json({ message: 'Rejected' })); // Simple stub
router.get('/listings/queue', getListingQueue);
router.patch('/listings/:id/approve', (req, res) => res.json({ message: 'Approved' }));
router.get('/users', getUsers);
router.get('/disputes', getDisputes);
router.patch('/disputes/:id/resolve', resolveDispute);

module.exports = router;
