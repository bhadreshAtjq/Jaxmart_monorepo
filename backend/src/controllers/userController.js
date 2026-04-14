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
    const { fullName, email, accountType, userType, businessName, gstNumber } = req.body;

    const data = {
      fullName,
      email,
      accountType,
      userType,
    };

    // If business details provided, create or update business profile
    if (accountType === 'BUSINESS' && (businessName || gstNumber)) {
      data.businessProfile = {
        upsert: {
          create: {
            businessName: businessName || 'My Business',
            gstin: gstNumber,
          },
          update: {
            businessName,
            gstin: gstNumber,
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
      },
    });
  } catch (err) {
    logger.error('updateProfile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = { getMe, updateProfile };
