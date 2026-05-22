const express = require('express');
const router = express.Router();
const {
  getOrders, getOrder, signContract, rejectContract,
  submitMilestone, approveMilestone,
  raiseDispute, getSellerDashboard,
  createDirectOrder
} = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getOrders);
router.post('/', authenticate, createDirectOrder);
router.get('/dashboard', authenticate, getSellerDashboard);
router.get('/:id', authenticate, getOrder);
router.post('/:id/contract-sign', authenticate, signContract);
router.post('/:id/contract-reject', authenticate, rejectContract);
router.post('/:orderId/milestones/:milestoneId/submit', authenticate, submitMilestone);
router.post('/:orderId/milestones/:milestoneId/approve', authenticate, approveMilestone);
router.post('/:orderId/disputes', authenticate, raiseDispute);

module.exports = router;
