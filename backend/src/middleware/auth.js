const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        phone: true,
        email: true,
        fullName: true,
        userType: true,
        accountType: true,
        kycStatus: true,
        trustScore: true,
        isActive: true,
        isAdmin: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[DEBUG] Authentication Error:', err);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }

    // Handle Prisma/Database errors specifically
    if (err.code && err.code.startsWith('P')) {
      return res.status(503).json({
        error: 'Database connection failed. Please try again in a few moments.',
        code: 'DATABASE_ERROR'
      });
    }

    return res.status(401).json({ error: 'Invalid token' });
  }
};

const requireKyc = (req, res, next) => {
  if (req.user.kycStatus !== 'VERIFIED') {
    return res.status(403).json({
      error: 'KYC verification required',
      code: 'KYC_REQUIRED',
    });
  }
  next();
};

const requireSeller = (req, res, next) => {
  if (!['SELLER', 'BOTH'].includes(req.user.userType)) {
    return res.status(403).json({ error: 'Seller account required' });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin && !['ADMIN', 'BOTH'].includes(req.user.userType)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const JWT_SECRET = process.env.JWT_SECRET || 'jaxmart_default_secret_jwt_key_min_32_chars_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'jaxmart_default_refresh_secret_key_min_32_chars_2026';

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  const refreshToken = jwt.sign(
    { userId },
    JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
  return { accessToken, refreshToken };
};

module.exports = { authenticate, requireKyc, requireSeller, requireAdmin, generateTokens };
