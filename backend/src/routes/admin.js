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
const {
  adminGetEvents,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');

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

// Admin Event Management
router.get('/events', adminGetEvents);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);

module.exports = router;

