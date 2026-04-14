const express = require('express');
const router = express.Router();
const {
  searchListings, getListing, createListing,
  updateListing, getMyListings, publishListing,
} = require('../controllers/listingController');
const { authenticate, requireSeller } = require('../middleware/auth');

router.get('/search', searchListings);
router.get('/seller/me', authenticate, requireSeller, getMyListings);
router.get('/:id', getListing);
router.post('/', authenticate, requireSeller, createListing);
router.put('/:id', authenticate, requireSeller, updateListing);
router.patch('/:id/publish', authenticate, requireSeller, publishListing);

module.exports = router;
