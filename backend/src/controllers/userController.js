const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

// GET /api/users/me
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        businessProfile: true,
        kycDocuments: true,
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    logger.error('getMe error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { fullName, email, accountType, userType, businessName, gstNumber, hasSeenTour } = req.body;

    const data = {
      fullName,
      email,
      accountType,
      userType,
      kycStatus: 'VERIFIED', // Auto-verify KYC in development
      hasSeenTour: hasSeenTour !== undefined ? hasSeenTour : undefined,
    };

    // If business details provided, or account is business, or user is seller/both, create or update business profile
    if ((accountType === 'BUSINESS' || userType === 'SELLER' || userType === 'BOTH') && (businessName || gstNumber || fullName)) {
      const bName = businessName || (fullName ? `${fullName}'s Business` : 'My Business');
      data.businessProfile = {
        upsert: {
          create: {
            businessName: bName,
            gstin: gstNumber || null,
          },
          update: {
            businessName: bName,
            gstin: gstNumber || null,
          },
        },
      };
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      include: { businessProfile: true },
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType,
        accountType: user.accountType,
        kycStatus: user.kycStatus,
        trustScore: user.trustScore,
        businessProfile: user.businessProfile,
        hasSeenTour: user.hasSeenTour,
      },
    });
  } catch (err) {
    logger.error('updateProfile error:', err);
    if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
      return res.status(400).json({ error: 'Email is already in use.' });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = { getMe, updateProfile };
