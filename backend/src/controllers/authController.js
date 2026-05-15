const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../config/database');
const { redis } = require('../config/redis');
const { generateTokens } = require('../middleware/auth');
const { sendSms } = require('../services/smsService');
const { logger } = require('../utils/logger');

// In-memory fallback for development if Redis is unavailable
const devOtpStore = new Map();

// Generate and cache OTP
const generateOtp = async (phone) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    await redis.setex(`otp:${phone}`, 300, otp); // 5 min TTL
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      devOtpStore.set(`otp:${phone}`, { otp, expires: Date.now() + 300000 });
      logger.warn(`Redis unavailable. Using in-memory store for OTP ${phone}`);
    } else {
      throw err;
    }
  }
  return otp;
};

// POST /api/auth/send-otp
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\d{7,15}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    try {
      const attempts = await redis.incr(`otp_attempts:${phone}`);
      if (attempts === 1) await redis.expire(`otp_attempts:${phone}`, 900);
      if (attempts > 3) {
        return res.status(429).json({ error: 'Too many OTP requests. Try again in 15 minutes.' });
      }
    } catch (err) {
      logger.warn(`Redis attempts tracking unavailable for ${phone}`);
    }

    const otp = await generateOtp(phone);

    // In production, send via SMS. In dev, return in response and allow 123456.
    if (process.env.NODE_ENV === 'production') {
      await sendSms(phone, `Your B2B Platform OTP is ${otp}. Valid for 5 minutes.`);
    } else {
      logger.info(`DEV OTP for ${phone}: ${otp} (Bypass: 123456)`);
    }

    res.json({
      message: 'OTP sent successfully',
      ...(process.env.NODE_ENV !== 'production' && { otp, bypass: '123456' }), 
    });
  } catch (err) {
    logger.error('sendOtp error:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

// POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, fullName, userType } = req.body;

    let storedOtp;
    try {
      storedOtp = await redis.get(`otp:${phone}`);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        const fall = devOtpStore.get(`otp:${phone}`);
        if (fall && fall.expires > Date.now()) {
          storedOtp = fall.otp;
        }
      }
    }

    const isDevBypass = process.env.NODE_ENV !== 'production' && String(otp) === '123456';
    
    logger.debug(`Verify OTP attempt: ${phone}, provided: ${otp}, bypass: ${isDevBypass}`);

    if (!isDevBypass && (!storedOtp || storedOtp !== String(otp))) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    try {
      await redis.del(`otp:${phone}`);
      await redis.del(`otp_attempts:${phone}`);
    } catch (err) {
      devOtpStore.delete(`otp:${phone}`);
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { phone } });
    const isNew = !user;

    if (!user) {
      const name = fullName || (process.env.NODE_ENV !== 'production' ? 'New User' : null);
      if (!name) {
        return res.status(400).json({ error: 'Full name required for new registration' });
      }
      user = await prisma.user.create({
        data: {
          phone,
          fullName: name,
          userType: userType || 'BUYER',
        },
      });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      message: isNew ? 'Account created' : 'Login successful',
      isNew,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        userType: user.userType,
        accountType: user.accountType,
        kycStatus: user.kycStatus,
        trustScore: user.trustScore,
        isAdmin: user.isAdmin,
        hasSeenTour: user.hasSeenTour,
      },
    });
  } catch (err) {
    logger.error('verifyOtp error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
};

// POST /api/auth/refresh
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ error: 'Refresh token required' });

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { token } });
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);

    await prisma.refreshToken.create({
      data: {
        userId: decoded.userId,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
};

// POST /api/auth/fcm-token
const updateFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    await prisma.user.update({
      where: { id: req.user.id },
      data: { fcmToken },
    });
    res.json({ message: 'FCM token updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update FCM token' });
  }
};

module.exports = { sendOtp, verifyOtp, refreshToken, logout, updateFcmToken };
