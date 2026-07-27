const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const kycController = require('../controllers/kycController');

/**
 * API Setu KYC Verification Routes
 * Base path: /api/kyc
 */

// All KYC routes require standard user authentication
router.use(authenticate);

// Get user KYC status & verified documents
router.get('/status', kycController.getKycStatus);

// API Setu Verifications
router.post('/verify-pan', kycController.verifyPan);
router.post('/verify-gstin', kycController.verifyGstin);
router.post('/verify-aadhaar', kycController.verifyAadhaar);
router.post('/verify-dl', kycController.verifyDrivingLicense);
router.post('/verify-udyam', kycController.verifyUdyam);

module.exports = router;
