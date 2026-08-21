const express = require('express');
const router = express.Router();
const {
  getMe,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  uploadKycDoc,
} = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

// Address Management
router.post('/addresses', authenticate, addAddress);
router.put('/addresses/:id', authenticate, updateAddress);
router.delete('/addresses/:id', authenticate, deleteAddress);

// KYC Document Upload
router.post('/kyc/upload', authenticate, uploadKycDoc);

module.exports = router;
