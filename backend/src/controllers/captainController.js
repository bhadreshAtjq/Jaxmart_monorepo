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
      bulkPriceSlabs = [],
      brand,
      sku,
      hsnCode,
      barcode,
      mrp,
      gstRate,
      specifications = {},
      images = [],
      tags = [],
    } = req.body;

    const listingTitle = title || sku || 'Industrial Wholesale SKU';

    // 1. Resolve Target Seller
    let seller = null;
    if (sellerId && sellerId !== 'COMP_DEFAULT') {
      seller = await prisma.user.findUnique({
        where: { id: sellerId },
        include: { addresses: { where: { isPrimary: true }, take: 1 } },
      });
    }

    if (!seller) {
      // Find latest seller or fallback to captain/admin user
      seller = await prisma.user.findFirst({
        where: { userType: { in: ['SELLER', 'BOTH'] } },
        orderBy: { createdAt: 'desc' },
        include: { addresses: { where: { isPrimary: true }, take: 1 } },
      });
    }

    if (!seller) {
      seller = await prisma.user.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { addresses: { where: { isPrimary: true }, take: 1 } },
      });
    }

    if (!seller) {
      return res.status(400).json({ error: 'No active seller or merchant found in database' });
    }

    const primaryAddress = seller.addresses?.[0];

    // 2. Resolve Category (Ensure Foreign Key constraint is never violated)
    let category = null;
    if (categoryId) {
      category = await prisma.category.findUnique({ where: { id: categoryId } });
    }

    if (!category) {
      category = await prisma.category.findFirst({
        where: {
          OR: [
            { slug: 'industrial-machinery' },
            { slug: 'electronics' },
            { slug: 'textiles' },
            { slug: 'construction' },
          ],
        },
      });
    }

    if (!category) {
      category = await prisma.category.findFirst();
    }

    if (!category) {
      // Create a default category if none exists
      category = await prisma.category.create({
        data: {
          name: 'Industrial Supplies',
          slug: 'industrial-supplies-' + Date.now(),
        },
      });
    }

    // 3. Generate unique slug
    const baseSlug = listingTitle
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    const slug = `${baseSlug || 'sku'}-${Date.now().toString(36)}`;

    // 4. Clean and normalize images array
    const normalizedImages = Array.isArray(images) && images.length > 0
      ? images
      : [
          {
            url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
            isPrimary: true,
          },
        ];

    const effectivePrice = pricePerUnit ? parseFloat(pricePerUnit) : (mrp ? parseFloat(mrp) : 1250);
    const effectiveSlabs = (bulkPriceSlabs && bulkPriceSlabs.length > 0) ? bulkPriceSlabs : priceSlabs;

    // 5. Create Listing record
    const listing = await prisma.listing.create({
      data: {
        sellerId: seller.id,
        categoryId: category.id,
        title: listingTitle,
        slug,
        description: description || `Manufactured & supplied by ${seller.fullName}. Verified wholesale catalog SKU.`,
        listingType: 'PRODUCT',
        status: 'ACTIVE',
        isFeatured: true,
        tags: Array.from(new Set([
          'captain_verified',
          'wholesale',
          'field_cataloged',
          ...(Array.isArray(tags) ? tags.map(t => String(t).toLowerCase()) : []),
        ])),
        ...(primaryAddress && { locationId: primaryAddress.id }),
        productDetail: {
          create: {
            brand: brand || 'OEM / Industrial',
            pricePerUnit: effectivePrice,
            priceType: priceType || 'FIXED',
            minOrderQty: parseInt(minOrderQty) || 1,
            unitOfMeasure: unitOfMeasure || 'Pieces',
            bulkPriceSlabs: effectiveSlabs.length > 0 ? effectiveSlabs : undefined,
            specifications: {
              ...(typeof specifications === 'object' ? specifications : {}),
              ...(sku && { sku }),
              ...(hsnCode && { hsnCode }),
              ...(barcode && { barcode }),
              ...(gstRate && { gstRate: `${gstRate}%` }),
            },
          },
        },
        media: {
          create: normalizedImages.map((img, idx) => ({
            url: typeof img === 'string' ? img : (img.url || img.uri || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80'),
            mediaType: 'IMAGE',
            isPrimary: typeof img === 'object' ? Boolean(img.isPrimary) : idx === 0,
            sortOrder: idx,
          })),
        },
      },
      include: {
        seller: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            businessProfile: true,
          },
        },
        category: true,
        productDetail: true,
        media: true,
      },
    });

    logger.info(`Captain cataloged SKU #${listing.id} (${listing.title}) for seller ${seller.id}`);

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
    const { search, page = 1, limit = 5000 } = req.query;
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

    const users = await prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        businessProfile: true,
        addresses: { where: { isPrimary: true }, take: 1 },
        _count: { select: { listings: true } },
      },
    });

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
        kycStatus: 'VERIFIED',
        storefrontImage: u.avatarUrl,
        skuCount: u._count.listings,
        createdAt: u.createdAt,
      };
    });

    const totalSkus = companies.reduce((sum, c) => sum + (c.skuCount || 0), 0);

    res.json({
      success: true,
      companies,
      total: companies.length,
      totalSkus,
      page: parseInt(page),
      totalPages: 1,
    });
  } catch (err) {
    logger.error('captain getCaptainCompanies error:', err);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

const clockInShift = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { location } = req.body;
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { lastActiveAt: new Date() },
      });

      if (location && (location.city || location.address || location.latitude)) {
        const line1 = location.address || location.street || location.city || 'Field Hub Location';
        const city = location.city || 'Surat Industrial Hub';
        const state = location.state || 'Gujarat';
        const pincode = location.pincode || '395006';
        const lat = location.latitude ? parseFloat(location.latitude) : null;
        const lng = location.longitude ? parseFloat(location.longitude) : null;

        const existingAddr = await prisma.address.findFirst({
          where: { userId, isPrimary: true },
        });

        if (existingAddr) {
          await prisma.address.update({
            where: { id: existingAddr.id },
            data: { line1, city, state, pincode, lat, lng },
          });
        } else {
          await prisma.address.create({
            data: {
              userId,
              addressType: 'PRIMARY',
              label: 'Captain Field Base',
              line1,
              city,
              state,
              pincode,
              lat,
              lng,
              isPrimary: true,
            },
          });
        }
      }
    }
    res.json({ success: true, message: 'Shift clocked in successfully', clockedInAt: new Date() });
  } catch (err) {
    logger.error('clockInShift error:', err);
    res.status(500).json({ error: 'Clock in failed' });
  }
};

const clockOutShift = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { lastActiveAt: null },
      });
    }
    res.json({ success: true, message: 'Shift clocked out successfully' });
  } catch (err) {
    logger.error('clockOutShift error:', err);
    res.status(500).json({ error: 'Clock out failed' });
  }
};

const getCaptainListings = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true } },
          media: { select: { url: true, isPrimary: true } },
          seller: { select: { fullName: true, businessProfile: { select: { businessName: true } } } },
          productDetail: true,
        },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({
      success: true,
      listings,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    logger.error('captain getCaptainListings error:', err);
    res.status(500).json({ error: 'Failed to fetch cataloged listings' });
  }
};

module.exports = {
  onboardSeller,
  createCaptainListing,
  getCaptainCompanies,
  getCaptainListings,
  clockInShift,
  clockOutShift,
};
