const express = require('express');
const router = express.Router();
const {
  getOrders, getOrder, signContract,
  submitMilestone, approveMilestone,
  raiseDispute, getSellerDashboard
} = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getOrders);
router.get('/dashboard', authenticate, getSellerDashboard);
router.get('/:id', authenticate, getOrder);
router.post('/:id/contract-sign', authenticate, signContract);
router.post('/:orderId/milestones/:milestoneId/submit', authenticate, submitMilestone);
router.post('/:orderId/milestones/:milestoneId/approve', authenticate, approveMilestone);
router.post('/:orderId/disputes', authenticate, raiseDispute);

module.exports = router;
