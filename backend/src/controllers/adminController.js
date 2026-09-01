const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');
const { signListingMedia, getPresignedUrl } = require('../utils/s3');

// GET /api/admin/analytics
const getAnalytics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      activeSellers,
      totalBuyers,
      openDisputes,
      kycPending,
      listingsPending,
      rfqsToday,
      totalRfqs,
      totalDeals,
      activeSubscriptions,
      pendingDeposits,
      ordersAgg,
      dealsAgg,
      leadsUnlockedToday,
    ] = await Promise.all([
      prisma.user.count({ where: { userType: { in: ['SELLER', 'BOTH'] }, isActive: true } }),
      prisma.user.count({ where: { userType: 'BUYER', isActive: true } }),
      prisma.dispute.count({ where: { status: 'OPEN' } }),
      prisma.user.count({ where: { kycStatus: 'PENDING' } }),
      prisma.listing.count({ where: { status: 'DRAFT' } }),
      prisma.rfqRequest.count({ where: { createdAt: { gte: today } } }),
      prisma.rfqRequest.count(),
      prisma.deal.count(),
      prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
        include: { plan: true },
      }),
      prisma.depositReceipt.count({ where: { status: 'PENDING' } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true, platformFee: true },
        where: { status: { in: ['COMPLETED', 'SHIPPED', 'ACTIVE', 'ACCEPTED'] } },
      }),
      prisma.deal.aggregate({
        _sum: { agreedAmount: true, assuredDealFee: true },
      }),
      prisma.leadUnlock.count({ where: { unlockedAt: { gte: today } } }),
    ]);

    // Compute Subscription MRR (Monthly Recurring Revenue)
    const mrr = activeSubscriptions.reduce((acc, sub) => {
      if (!sub.plan) return acc;
      const monthlyEquivalent = sub.billingCycle === 'YEARLY' ? sub.plan.yearlyPrice / 12 : sub.plan.monthlyPrice;
      return acc + monthlyEquivalent;
    }, 0);

    const stats = {
      totalGmv: (ordersAgg._sum.totalAmount || 0) + (dealsAgg._sum.agreedAmount || 0),
      totalFeeRevenue: (ordersAgg._sum.platformFee || 0) + (dealsAgg._sum.assuredDealFee || 0),
      mrr: Math.round(mrr),
      activeSubscribers: activeSubscriptions.length,
      activeSellers,
      totalBuyers,
      totalRfqs,
      rfqsToday,
      totalDeals,
      leadsUnlockedToday,
      openDisputes,
      kycPending,
      listingsPending,
      pendingDeposits,
      conversionRate: totalRfqs > 0 ? Number(((totalDeals / totalRfqs) * 100).toFixed(1)) : 0,
    };

    res.json(stats);
  } catch (err) {
    logger.error('getAnalytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// GET /api/admin/kyc/queue
const getKycQueue = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const where = {};
    if (status && status !== 'ALL') {
      if (status === 'PENDING') {
        where.kycStatus = { in: ['PENDING', 'UNDER_REVIEW'] };
      } else {
        where.kycStatus = status;
      }
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { businessProfile: { businessName: { contains: q, mode: 'insensitive' } } },
        { businessProfile: { gstin: { contains: q, mode: 'insensitive' } } },
        { businessProfile: { pan: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [users, total, pendingCount, verifiedCount, rejectedCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          businessProfile: true,
          kycDocuments: true,
          addresses: { where: { isPrimary: true }, take: 1 },
          _count: { select: { listings: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit, 10),
      }),
      prisma.user.count({ where }),
      prisma.user.count({ where: { kycStatus: { in: ['PENDING', 'UNDER_REVIEW'] } } }),
      prisma.user.count({ where: { kycStatus: 'VERIFIED' } }),
      prisma.user.count({ where: { kycStatus: 'REJECTED' } }),
    ]);

    // Sign any document URLs in kycDocuments and user avatar
    const signedQueue = await Promise.all(
      users.map(async (u) => {
        const signedDocs = await Promise.all(
          u.kycDocuments.map(async (doc) => ({
            ...doc,
            documentUrl: await getPresignedUrl(doc.documentUrl),
            backSideUrl: doc.backSideUrl ? await getPresignedUrl(doc.backSideUrl) : null,
          }))
        );
        const signedAvatar = u.avatarUrl ? await getPresignedUrl(u.avatarUrl) : null;
        return {
          id: u.id,
          userId: u.id,
          user: { ...u, avatarUrl: signedAvatar, kycDocuments: signedDocs },
          documents: signedDocs,
          createdAt: u.createdAt,
        };
      })
    );

    res.json({
      success: true,
      queue: signedQueue,
      users: signedQueue.map((item) => item.user),
      total,
      pendingCount,
      verifiedCount,
      rejectedCount,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
    });
  } catch (err) {
    logger.error('getKycQueue error:', err);
    res.status(500).json({ error: 'Failed to fetch KYC queue' });
  }
};

// PATCH /api/admin/kyc/:userId/approve
const approveKyc = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'VERIFIED',
        trustScore: { increment: 15 },
        businessProfile: {
          update: { verifiedAt: new Date() },
        },
      },
      include: { businessProfile: true, kycDocuments: true },
    });
    await prisma.kycDocument.updateMany({
      where: { userId, status: 'PENDING' },
      data: { status: 'VERIFIED', reviewedAt: new Date(), reviewedBy: req.user?.id },
    });
    res.json({ success: true, user, message: 'KYC verified and merchant activated' });
  } catch (err) {
    logger.error('approveKyc error:', err);
    res.status(500).json({ error: 'Approval failed' });
  }
};

// PATCH /api/admin/kyc/:userId/reject
const rejectKyc = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason = 'Documents failed verification' } = req.body;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'REJECTED' },
      include: { businessProfile: true, kycDocuments: true },
    });
    await prisma.kycDocument.updateMany({
      where: { userId, status: 'PENDING' },
      data: { status: 'REJECTED', reviewNote: reason, reviewedAt: new Date(), reviewedBy: req.user?.id },
    });
    res.json({ success: true, user, message: 'KYC rejected' });
  } catch (err) {
    logger.error('rejectKyc error:', err);
    res.status(500).json({ error: 'Rejection failed' });
  }
};

// GET /api/admin/listings/queue
const getListingQueue = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 100 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { category: { name: { contains: q, mode: 'insensitive' } } },
        { seller: { fullName: { contains: q, mode: 'insensitive' } } },
        { seller: { businessProfile: { businessName: { contains: q, mode: 'insensitive' } } } },
      ];
    }

    const [listings, total, draftCount, activeCount, rejectedCount] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true,
              businessProfile: { select: { businessName: true, gstin: true } },
            },
          },
          category: { select: { id: true, name: true, slug: true } },
          media: { select: { id: true, url: true, isPrimary: true }, take: 3 },
          productDetail: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit, 10),
      }),
      prisma.listing.count({ where }),
      prisma.listing.count({ where: { status: 'DRAFT' } }),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.listing.count({ where: { status: 'REJECTED' } }),
    ]);

    const signedListings = await Promise.all(listings.map((l) => signListingMedia(l)));

    res.json({
      success: true,
      listings: signedListings,
      queue: signedListings,
      total,
      draftCount,
      activeCount,
      rejectedCount,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
    });
  } catch (err) {
    logger.error('getListingQueue error:', err);
    res.status(500).json({ error: 'Failed to fetch listing queue' });
  }
};

const approveListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await prisma.listing.update({
      where: { id },
      data: { status: 'ACTIVE', publishedAt: new Date() },
      include: {
        seller: { select: { fullName: true, businessProfile: { select: { businessName: true } } } },
        category: true,
        media: true,
        productDetail: true,
      },
    });
    res.json({ success: true, listing, message: 'SKU published to live marketplace' });
  } catch (err) {
    logger.error('approveListing error:', err);
    res.status(500).json({ error: 'Failed to approve listing' });
  }
};

const rejectListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await prisma.listing.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: {
        seller: { select: { fullName: true, businessProfile: { select: { businessName: true } } } },
        category: true,
        media: true,
        productDetail: true,
      },
    });
    res.json({ success: true, listing, message: 'SKU rejected / unindexed' });
  } catch (err) {
    logger.error('rejectListing error:', err);
    res.status(500).json({ error: 'Failed to reject listing' });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { search, limit, userType, kycStatus } = req.query;
    const parsedLimit = parseInt(limit, 10) || 200;

    const where = {};
    if (search && search.trim() !== '') {
      const cleanSearch = search.trim();
      where.OR = [
        { fullName: { contains: cleanSearch, mode: 'insensitive' } },
        { email: { contains: cleanSearch, mode: 'insensitive' } },
        { phone: { contains: cleanSearch, mode: 'insensitive' } },
        { businessProfile: { businessName: { contains: cleanSearch, mode: 'insensitive' } } },
        { businessProfile: { gstin: { contains: cleanSearch, mode: 'insensitive' } } },
        { businessProfile: { pan: { contains: cleanSearch, mode: 'insensitive' } } },
      ];
    }

    if (userType && userType !== 'ALL') {
      where.userType = userType;
    }

    if (kycStatus && kycStatus !== 'ALL') {
      where.kycStatus = kycStatus;
    }

    const users = await prisma.user.findMany({
      where,
      take: parsedLimit,
      orderBy: { createdAt: 'desc' },
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
            buyerOrders: true,
            sellerOrders: true,
            rfqRequests: true,
            rfqQuotes: true,
          },
        },
      },
    });

    res.json({ users });
  } catch (err) {
    logger.error('getUsers error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getDisputes = async (req, res) => {
  try {
    const disputes = await prisma.dispute.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        order: { include: { buyer: true, seller: true } },
      },
    });
    res.json({ disputes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch disputes' });
  }
};

const resolveDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNote } = req.body;
    const dispute = await prisma.dispute.update({
      where: { id },
      data: {
        status: status || 'RESOLVED_PARTIAL',
        resolutionNote,
        resolvedAt: new Date(),
      },
    });
    res.json({ success: true, dispute });
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve dispute' });
  }
};

// ─── Captain Administration Endpoints ──────────────────────────────────────────

const getAdminCaptains = async (req, res) => {
  try {
    const captains = await prisma.user.findMany({
      where: {
        OR: [
          { isAdmin: true },
          { userType: 'BOTH' },
        ],
      },
      include: {
        addresses: { where: { isPrimary: true }, take: 1 },
        _count: {
          select: {
            listings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedCaptains = captains.map((c) => {
      const primaryAddr = c.addresses[0];
      const isClockedIn = Boolean(
        c.lastActiveAt && (Date.now() - new Date(c.lastActiveAt).getTime() < 14 * 3600 * 1000)
      );

      const cityName = primaryAddr?.city || primaryAddr?.line1 || 'Pan India';
      const gpsCoords = primaryAddr?.lat && primaryAddr?.lng
        ? `${primaryAddr.lat.toFixed(4)}, ${primaryAddr.lng.toFixed(4)}`
        : null;

      return {
        id: c.id,
        fullName: c.fullName,
        phone: c.phone,
        email: c.email,
        avatarUrl: c.avatarUrl,
        trustScore: c.trustScore,
        isAdmin: c.isAdmin,
        userType: c.userType,
        territory: cityName,
        city: cityName,
        gps: gpsCoords,
        status: isClockedIn ? 'PUNCHED_IN' : 'PUNCHED_OUT',
        isClockedIn,
        lastClockInAt: c.lastActiveAt,
        totalOnboarded: c._count.listings > 0 ? c._count.listings : 0,
        totalSkus: c._count.listings || 0,
        createdAt: c.createdAt,
      };
    });

    res.json({ success: true, captains: formattedCaptains });
  } catch (err) {
    logger.error('getAdminCaptains error:', err);
    res.status(500).json({ error: 'Failed to fetch captains' });
  }
};

const createAdminCaptain = async (req, res) => {
  try {
    const { fullName, phone, email, territory = 'Pan India' } = req.body;
    if (!fullName || !phone) {
      return res.status(400).json({ error: 'Full name and phone are required' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const last10 = cleanPhone.slice(-10);

    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { phone: last10 },
          { phone: `+91${last10}` },
          { phone: `91${last10}` },
          ...(email && email.trim() ? [{ email: email.trim() }] : []),
        ],
      },
    });

    if (user) {
      // If user is already a captain, return warning so existing captain isn't overwritten
      if (user.isAdmin || user.userType === 'BOTH') {
        return res.status(400).json({
          error: `Field Captain with number +91 ${last10} is already deployed as "${user.fullName}". Please use a new mobile number for a new captain.`,
        });
      }

      // Promote existing user to captain
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          isAdmin: true,
          userType: 'BOTH',
          fullName,
          email: email && email.trim() ? email.trim() : user.email,
        },
      });
    } else {
      // Create new captain record
      user = await prisma.user.create({
        data: {
          fullName,
          phone: cleanPhone,
          email: email && email.trim() ? email.trim() : null,
          isAdmin: true,
          userType: 'BOTH',
          kycStatus: 'VERIFIED',
          trustScore: 100,
          addresses: {
            create: {
              line1: territory || 'Pan India',
              city: territory || 'Surat Industrial Hub',
              state: 'Gujarat',
              pincode: '395006',
              isPrimary: true,
            },
          },
        },
      });
    }

    res.status(201).json({ success: true, message: 'Field Captain deployed successfully', captain: user });
  } catch (err) {
    logger.error('createAdminCaptain error:', err);
    res.status(500).json({ error: err.message || 'Failed to create captain' });
  }
};

const getAdminCaptainOnboardings = async (req, res) => {
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

    const sellers = await prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        businessProfile: true,
        addresses: { where: { isPrimary: true }, take: 1 },
        kycDocuments: true,
        _count: { select: { listings: true } },
      },
    });

    const onboardings = sellers.map((s) => {
      const addr = s.addresses[0];
      return {
        id: s.id,
        legalName: s.businessProfile?.businessName || s.fullName,
        tradeName: s.businessProfile?.tradeName || s.businessProfile?.businessName,
        gstin: s.businessProfile?.gstin,
        pan: s.businessProfile?.pan,
        udyamNumber: s.businessProfile?.udyamNumber,
        ownerName: s.fullName,
        phone: s.phone,
        email: s.email,
        city: addr?.city || 'Mumbai',
        state: addr?.state || 'Maharashtra',
        pincode: addr?.pincode,
        gps: addr?.lat && addr?.lng ? `${addr.lat}, ${addr.lng}` : null,
        category: s.businessProfile?.businessType || 'Manufacturing',
        kycStatus: 'VERIFIED',
        storefrontImage: s.avatarUrl,
        documents: s.kycDocuments,
        skuCount: s._count.listings,
        createdAt: s.createdAt,
      };
    });

    res.json({ success: true, onboardings, total: onboardings.length });
  } catch (err) {
    logger.error('getAdminCaptainOnboardings error:', err);
    res.status(500).json({ error: 'Failed to fetch captain onboardings' });
  }
};

const getAdminCaptainListings = async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      take: 10000,
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            businessProfile: { select: { businessName: true, gstin: true } },
          },
        },
        category: { select: { id: true, name: true, slug: true } },
        productDetail: true,
        media: { orderBy: { isPrimary: 'desc' } },
      },
    });

    const signedListings = await Promise.all(listings.map((l) => signListingMedia(l)));

    res.json({ success: true, listings: signedListings });
  } catch (err) {
    logger.error('getAdminCaptainListings error:', err);
    res.status(500).json({ error: 'Failed to fetch captain listings' });
  }
};

module.exports = {
  getAnalytics,
  getKycQueue,
  approveKyc,
  rejectKyc,
  getListingQueue,
  approveListing,
  rejectListing,
  getUsers,
  getDisputes,
  resolveDispute,
  getAdminCaptains,
  createAdminCaptain,
  getAdminCaptainOnboardings,
  getAdminCaptainListings,
};

