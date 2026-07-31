// routes/rfq.js
const express = require('express');
const router = express.Router();
const {
  createRfq, getMyRfqs, getRfq, getSellerRfqInbox,
  submitQuote, awardQuote, shortlistQuote, getRfqNotifiedSellers
} = require('../controllers/rfqController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, createRfq);
router.get('/my', authenticate, getMyRfqs);
router.get('/seller/inbox', authenticate, getSellerRfqInbox);
router.get('/:id', authenticate, getRfq);
router.get('/:id/notified-sellers', authenticate, getRfqNotifiedSellers);
router.post('/:id/quotes', authenticate, submitQuote);
router.patch('/:id/award/:quoteId', authenticate, awardQuote);
router.patch('/quotes/:quoteId/shortlist', authenticate, shortlistQuote);

module.exports = router;
