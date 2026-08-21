const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

// GET /api/users/me
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        businessProfile: {
          include: {
            certifications: true,
          },
        },
        addresses: {
          orderBy: { isPrimary: 'desc' },
        },
        kycDocuments: {
          orderBy: { createdAt: 'desc' },
        },
        subscription: {
          include: { plan: true },
        },
        wallet: true,
        _count: {
          select: {
            listings: true,
            rfqRequests: true,
            rfqQuotes: true,
            buyerOrders: true,
            sellerOrders: true,
            reviewsReceived: true,
          },
        },
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
    const {
      fullName,
      email,
      phone,
      accountType,
      userType,
      avatarUrl,
      coverUrl,
      language,
      timezone,
      currency,
      hasSeenTour,
      // Business Profile Fields
      businessName,
      gstNumber,
      gstin,
      pan,
      mcaCin,
      msmeNumber,
      udyamNumber,
      iecCode,
      establishedYear,
      employeeRange,
      annualTurnover,
      website,
      linkedinUrl,
      description,
      businessType,
      exportCapable,
    } = req.body;

    const data = {};

    if (fullName !== undefined) data.fullName = fullName;
    if (email !== undefined) data.email = email || null;
    if (phone !== undefined) data.phone = phone;
    if (accountType !== undefined) data.accountType = accountType;
    if (userType !== undefined) data.userType = userType;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
    if (coverUrl !== undefined) data.coverUrl = coverUrl;
    if (language !== undefined) data.language = language;
    if (timezone !== undefined) data.timezone = timezone;
    if (currency !== undefined) data.currency = currency;
    if (hasSeenTour !== undefined) data.hasSeenTour = hasSeenTour;

    const effectiveGstin = gstin || gstNumber;
    const isBusiness = accountType === 'BUSINESS' || userType === 'SELLER' || userType === 'BOTH';

    if (isBusiness || businessName || effectiveGstin || description || website || pan || udyamNumber || iecCode) {
      const bName = businessName || (fullName ? `${fullName}'s Business` : 'My B2B Company');

      const businessData = {
        businessName: bName,
        gstin: effectiveGstin || null,
        pan: pan || (effectiveGstin && effectiveGstin.length >= 12 ? effectiveGstin.substring(2, 12) : null),
        mcaCin: mcaCin || null,
        msmeNumber: msmeNumber || null,
        udyamNumber: udyamNumber || null,
        iecCode: iecCode || null,
        establishedYear: establishedYear ? parseInt(establishedYear, 10) : null,
        employeeRange: employeeRange || null,
        annualTurnover: annualTurnover || null,
        website: website || null,
        linkedinUrl: linkedinUrl || null,
        description: description || null,
        businessType: businessType || null,
        exportCapable: exportCapable !== undefined ? Boolean(exportCapable) : false,
      };

      data.businessProfile = {
        upsert: {
          create: businessData,
          update: businessData,
        },
      };
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      include: {
        businessProfile: {
          include: {
            certifications: true,
          },
        },
        addresses: true,
        kycDocuments: true,
        subscription: { include: { plan: true } },
        wallet: true,
      },
    });

    res.json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (err) {
    logger.error('updateProfile error:', err);
    if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
      return res.status(400).json({ error: 'Email is already in use.' });
    }
    if (err.code === 'P2002' && err.meta?.target?.includes('gstin')) {
      return res.status(400).json({ error: 'GSTIN is already registered to another account.' });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// POST /api/users/addresses
const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressType, label, contactName, contactPhone, line1, line2, landmark, city, state, pincode, country, isPrimary } = req.body;

    if (!line1 || !city || !state || !pincode) {
      return res.status(400).json({ error: 'line1, city, state, and pincode are required.' });
    }

    if (isPrimary) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isPrimary: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        addressType: addressType || 'PRIMARY',
        label: label || 'Main Facility',
        contactName: contactName || req.user.fullName,
        contactPhone: contactPhone || req.user.phone,
        line1,
        line2: line2 || null,
        landmark: landmark || null,
        city,
        state,
        pincode,
        country: country || 'India',
        isPrimary: isPrimary !== undefined ? Boolean(isPrimary) : true,
      },
    });

    res.json({ success: true, message: 'Address registered successfully', address });
  } catch (err) {
    logger.error('addAddress error:', err);
    res.status(500).json({ error: 'Failed to add address' });
  }
};

// PUT /api/users/addresses/:id
const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { addressType, label, contactName, contactPhone, line1, line2, landmark, city, state, pincode, country, isPrimary } = req.body;

    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: 'Address not found' });

    if (isPrimary) {
      await prisma.address.updateMany({
        where: { userId, id: { not: id } },
        data: { isPrimary: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        addressType: addressType || existing.addressType,
        label: label !== undefined ? label : existing.label,
        contactName: contactName !== undefined ? contactName : existing.contactName,
        contactPhone: contactPhone !== undefined ? contactPhone : existing.contactPhone,
        line1: line1 || existing.line1,
        line2: line2 !== undefined ? line2 : existing.line2,
        landmark: landmark !== undefined ? landmark : existing.landmark,
        city: city || existing.city,
        state: state || existing.state,
        pincode: pincode || existing.pincode,
        country: country || existing.country,
        isPrimary: isPrimary !== undefined ? Boolean(isPrimary) : existing.isPrimary,
      },
    });

    res.json({ success: true, message: 'Address updated successfully', address });
  } catch (err) {
    logger.error('updateAddress error:', err);
    res.status(500).json({ error: 'Failed to update address' });
  }
};

// DELETE /api/users/addresses/:id
const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: 'Address not found' });

    await prisma.address.delete({ where: { id } });
    res.json({ success: true, message: 'Address removed successfully' });
  } catch (err) {
    logger.error('deleteAddress error:', err);
    res.status(500).json({ error: 'Failed to delete address' });
  }
};

// POST /api/users/kyc/upload
const uploadKycDoc = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentType, documentNumber, documentUrl, backSideUrl } = req.body;

    if (!documentType || !documentUrl) {
      return res.status(400).json({ error: 'documentType and documentUrl are required.' });
    }

    const doc = await prisma.kycDocument.create({
      data: {
        userId,
        documentType,
        documentNumber: documentNumber || null,
        documentUrl,
        backSideUrl: backSideUrl || null,
        status: 'PENDING',
        verificationMethod: 'MANUAL',
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'UNDER_REVIEW' },
    });

    res.json({ success: true, message: 'Document submitted for verification', document: doc });
  } catch (err) {
    logger.error('uploadKycDoc error:', err);
    res.status(500).json({ error: 'Failed to submit KYC document' });
  }
};

module.exports = {
  getMe,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  uploadKycDoc,
};
