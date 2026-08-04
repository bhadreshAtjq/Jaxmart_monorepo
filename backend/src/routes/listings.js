const express = require('express');
const router = express.Router();
const {
  searchListings, getSearchSuggestions, getListing, createListing,
  updateListing, getMyListings, publishListing, bulkCreateListings,
  getNewProducts
} = require('../controllers/listingController');
const { authenticate, requireSeller } = require('../middleware/auth');
const { checkProductLimit } = require('../middleware/subscriptionMiddleware');

router.get('/search', searchListings);
router.get('/suggestions', getSearchSuggestions);
router.get('/new-products', getNewProducts);
router.get('/seller/me', authenticate, requireSeller, getMyListings);
router.get('/:id', getListing);
router.post('/', authenticate, requireSeller, checkProductLimit, createListing);
router.put('/:id', authenticate, requireSeller, updateListing);
router.patch('/:id/publish', authenticate, requireSeller, publishListing);
router.post('/bulk', authenticate, requireSeller, checkProductLimit, bulkCreateListings);

module.exports = router;
