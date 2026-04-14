// routes/auth.js
const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, refreshToken, logout, updateFcmToken } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/fcm-token', authenticate, updateFcmToken);

module.exports = router;
