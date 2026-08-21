const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  onboardSeller,
  createCaptainListing,
  getCaptainCompanies,
} = require('../controllers/captainController');

// All captain endpoints require authentication
router.post('/onboard-seller', authenticate, onboardSeller);
router.post('/listings', authenticate, createCaptainListing);
router.get('/companies', authenticate, getCaptainCompanies);

module.exports = router;
