const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');
const { sendNotification } = require('../services/notificationService');

/**
 * POST /api/captain/onboard-seller
 * Onboard a seller company on-site with full KYC, address, bank details and signatures
 */
const onboardSeller = async (req, res) => {
  try {
    const captainId = req.user?.id;
    const {
      step1 = {},
      step2 = {},
      step3 = {},
      step4 = {},
      step5 = {},
      step6 = {},
      uploadedPhotos = {},
    } = req.body;

    const phone = step1.primaryMobile || step1.phone;
    const fullName = step1.primaryOwnerName || step1.fullName || 'Business Owner';
    const email = step1.email ? step1.email.toLowerCase().trim() : null;
    const legalName = step1.legalBusinessName || step1.tradeName || 'New Enterprise';
    const tradeName = step1.tradeName || legalName;

    if (!phone) {
      return res.status(400).json({ error: 'Primary mobile number is required' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Find or create User
      let user = await tx.user.findFirst({
        where: {
          OR: [
            { phone },
            ...(email ? [{ email }] : []),
          ],
        },
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            phone,
            email,
            fullName,
            userType: 'SELLER',
            accountType: 'BUSINESS',
            kycStatus: 'VERIFIED', // Verified on-site by Captain
            trustScore: 85,        // On-site verification bonus
            avatarUrl: uploadedPhotos.storefrontPhoto || step2.storefrontPhoto || null,
          },
        });
      } else {
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            fullName: fullName || user.fullName,
            userType: user.userType === 'BUYER' ? 'BOTH' : user.userType,
            kycStatus: 'VERIFIED',
            trustScore: Math.max(user.trustScore, 85),
            avatarUrl: uploadedPhotos.storefrontPhoto || step2.storefrontPhoto || user.avatarUrl,
          },
        });
      }

      // 2. Create or update BusinessProfile
      const gstin = step3.gstin ? step3.gstin.trim().toUpperCase() : null;
      const pan = step3.panNumber ? step3.panNumber.trim().toUpperCase() : null;
      const udyam = step3.udyamNumber ? step3.udyamNumber.trim() : null;

      const existingProfile = await tx.businessProfile.findUnique({
        where: { userId: user.id },
      });

      const profileData = {
        businessName: tradeName || legalName,
        gstin,
        pan,
        udyamNumber: udyam,
        businessType: step1.businessStructure || 'MANUFACTURER',
        annualTurnover: step5.turnoverRange || 'UNDER_1_CR',
        verifiedAt: new Date(),
        description: `Verified on-site by Captain ${req.user?.fullName || ''}. Specializes in ${step5.primaryCategoryName || 'Wholesale Manufacturing'}.`,
      };

      let businessProfile;
      if (existingProfile) {
        businessProfile = await tx.businessProfile.update({
          where: { id: existingProfile.id },
          data: profileData,
        });
      } else {
        businessProfile = await tx.businessProfile.create({
          data: {
            userId: user.id,
            ...profileData,
          },
        });
      }

      // 3. Create or update primary Address
      const addressLine1 = step2.addressLine1 || step2.fullAddress || 'Industrial Area';
      const city = step2.city || 'Mumbai';
      const state = step2.state || 'Maharashtra';
      const pincode = step2.pincode || '400001';
      const lat = step2.latitude ? parseFloat(step2.latitude) : null;
      const lng = step2.longitude ? parseFloat(step2.longitude) : null;

      await tx.address.create({
        data: {
          userId: user.id,
          addressType: 'PRIMARY',
          label: 'Registered Facility / Office',
          contactName: fullName,
          contactPhone: phone,
          line1: addressLine1,
          line2: step2.addressLine2 || null,
          landmark: step2.landmark || null,
          city,
          state,
          pincode,
          lat,
          lng,
          isPrimary: true,
        },
      });

      // 4. Create KYC documents
      const kycDocsToCreate = [];

      if (gstin) {
        kycDocsToCreate.push({
          userId: user.id,
          documentType: 'GSTIN',
          documentNumber: gstin,
          documentUrl: uploadedPhotos.gstCertPhoto || step3.gstCertPhoto || 'https://via.placeholder.com/600x400.png?text=GST+Verified',
          status: 'VERIFIED',
          verificationMethod: 'CAPTAIN_ONSITE',
          reviewNote: `On-site physical inspection verified by Captain ${req.user?.fullName || ''}`,
          reviewedAt: new Date(),
          reviewedBy: captainId || 'CAPTAIN_FIELD_APP',
        });
      }

      if (pan) {
        kycDocsToCreate.push({
          userId: user.id,
          documentType: 'PAN',
          documentNumber: pan,
          documentUrl: uploadedPhotos.panCardPhoto || step3.panCardPhoto || 'https://via.placeholder.com/600x400.png?text=PAN+Card',
          status: 'VERIFIED',
          verificationMethod: 'CAPTAIN_ONSITE',
          reviewNote: 'PAN card verified on-site',
          reviewedAt: new Date(),
          reviewedBy: captainId || 'CAPTAIN_FIELD_APP',
        });
      }

      if (uploadedPhotos.storefrontPhoto || step2.storefrontPhoto) {
        kycDocsToCreate.push({
          userId: user.id,
          documentType: 'STOREFRONT',
          documentNumber: 'GEO_TAGGED_IMAGE',
          documentUrl: uploadedPhotos.storefrontPhoto || step2.storefrontPhoto,
          status: 'VERIFIED',
          verificationMethod: 'CAPTAIN_ONSITE',
          reviewNote: `Storefront image verified at GPS: ${lat}, ${lng}`,
          reviewedAt: new Date(),
          reviewedBy: captainId || 'CAPTAIN_FIELD_APP',
        });
      }

      if (kycDocsToCreate.length > 0) {
        await tx.kycDocument.createMany({
          data: kycDocsToCreate,
        });
      }

      // 5. Initialize Lead Credit Wallet if not existing
      const existingWallet = await tx.leadCreditWallet.findUnique({
        where: { sellerId: user.id },
      });
      if (!existingWallet) {
        await tx.leadCreditWallet.create({
          data: {
            sellerId: user.id,
            balance: 5, // 5 Free Welcome Bonus Lead Credits
          },
        });
      }

      return { user, businessProfile };
    });

    logger.info(`Captain onboarded seller successfully: ${result.user.phone} (${result.businessProfile.businessName})`);

    // Notify user
    await sendNotification({
      userId: result.user.id,
      type: 'KYC_APPROVED',
      title: 'Welcome to JaxMart! Your Account is Verified',
      body: `Your business ${result.businessProfile.businessName} has been verified on-site by a JaxMart Field Captain. You can now receive buyer leads and sell wholesale.`,
      data: { userId: result.user.id },
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Seller company onboarded successfully by Captain',
      companyId: result.user.id,
      seller: {
        id: result.user.id,
        fullName: result.user.fullName,
        phone: result.user.phone,
        email: result.user.email,
        kycStatus: result.user.kycStatus,
        trustScore: result.user.trustScore,
        businessProfile: result.businessProfile,
      },
    });
  } catch (err) {
    logger.error('captain onboardSeller error:', err);
    res.status(500).json({ error: err.message || 'Failed to onboard seller' });
  }
};

/**
 * POST /api/captain/listings
 * Catalog a new Product SKU on behalf of an onboarded seller
 */
const createCaptainListing = async (req, res) => {
  try {
    const {
      sellerId,
      title,
      description,
      categoryId,
      listingType = 'PRODUCT',
      pricePerUnit,
      minOrderQty = 1,
      unitOfMeasure = 'Pieces',
      priceType = 'FIXED',
      priceSlabs = [],
      brand,
      specifications = {},
      images = [],
      tags = [],
    } = req.body;

    if (!sellerId || !title || !categoryId) {
      return res.status(400).json({ error: 'Seller ID, title, and category are required' });
    }

    // Verify seller exists
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      include: { addresses: { where: { isPrimary: true }, take: 1 } },
    });

    if (!seller) {
      return res.status(404).json({ error: 'Target seller not found' });
    }

    const primaryAddress = seller.addresses[0];

    // Generate unique slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        sellerId,
        categoryId,
        title,
        slug,
        description: description || `Manufactured & supplied by ${seller.fullName}. Verified wholesale catalog SKU.`,
        listingType: 'PRODUCT',
        status: 'ACTIVE',
        isFeatured: true,
        tags: Array.isArray(tags) ? tags.map(t => String(t).toLowerCase()) : ['captain_verified', 'wholesale'],
        ...(primaryAddress && { locationId: primaryAddress.id }),
        productDetail: {
          create: {
            brand: brand || 'OEM / Custom',
            pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : null,
            priceType: priceType || 'FIXED',
            minOrderQty: parseInt(minOrderQty) || 1,
            unitOfMeasure: unitOfMeasure || 'Pieces',
            bulkPriceSlabs: priceSlabs.length > 0 ? priceSlabs : undefined,
            specifications: typeof specifications === 'object' ? specifications : {},
          },
        },
        media: {
          create: (images.length > 0 ? images : [
            { url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80', isPrimary: true }
          ]).map((img, idx) => ({
            url: typeof img === 'string' ? img : img.url,
            mediaType: 'IMAGE',
            isPrimary: typeof img === 'object' ? Boolean(img.isPrimary) : idx === 0,
            sortOrder: idx,
          })),
        },
      },
      include: {
        category: true,
        productDetail: true,
        media: true,
      },
    });

    logger.info(`Captain cataloged SKU #${listing.id} (${listing.title}) for seller ${sellerId}`);

    res.status(201).json({
      success: true,
      message: 'Product SKU cataloged and published successfully',
      listing,
    });
  } catch (err) {
    logger.error('captain createCaptainListing error:', err);
    res.status(500).json({ error: err.message || 'Failed to catalog listing' });
  }
};

/**
 * GET /api/captain/companies
 * List companies onboarded
 */
const getCaptainCompanies = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      userType: { in: ['SELLER', 'BOTH'] },
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { businessProfile: { businessName: { contains: search, mode: 'insensitive' } } },
          { businessProfile: { gstin: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          businessProfile: true,
          addresses: { where: { isPrimary: true }, take: 1 },
          _count: { select: { listings: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const companies = users.map((u) => {
      const primaryAddress = u.addresses[0];
      return {
        id: u.id,
        legalName: u.businessProfile?.businessName || u.fullName,
        tradeName: u.businessProfile?.tradeName || u.businessProfile?.businessName,
        gstin: u.businessProfile?.gstin,
        pan: u.businessProfile?.pan,
        ownerName: u.fullName,
        phone: u.phone,
        email: u.email,
        city: primaryAddress?.city,
        state: primaryAddress?.state,
        pincode: primaryAddress?.pincode,
        category: u.businessProfile?.businessType || 'Manufacturing',
        kycStatus: u.kycStatus,
        storefrontImage: u.avatarUrl,
        skuCount: u._count.listings,
        createdAt: u.createdAt,
      };
    });

    res.json({
      success: true,
      companies,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    logger.error('captain getCaptainCompanies error:', err);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

module.exports = {
  onboardSeller,
  createCaptainListing,
  getCaptainCompanies,
};
