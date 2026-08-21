const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

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
    const users = await prisma.user.findMany({
      where: { kycStatus: { in: ['PENDING', 'UNDER_REVIEW'] } },
      include: {
        businessProfile: true,
        kycDocuments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const queue = users.map((u) => ({
      id: u.id,
      userId: u.id,
      user: u,
      documents: u.kycDocuments,
      createdAt: u.createdAt,
    }));

    res.json({ queue });
  } catch (err) {
    logger.error('getKycQueue error:', err);
    res.status(500).json({ error: 'Failed to fetch KYC queue' });
  }
};

// PATCH /api/admin/kyc/:userId/approve
const approveKyc = async (req, res) => {
  try {
    const { userId } = req.params;
    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'VERIFIED', trustScore: { increment: 25 } },
    });
    res.json({ success: true, message: 'KYC verified and trust score updated' });
  } catch (err) {
    res.status(500).json({ error: 'Approval failed' });
  }
};

// PATCH /api/admin/kyc/:userId/reject
const rejectKyc = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'REJECTED' },
    });
    res.json({ success: true, message: 'KYC rejected' });
  } catch (err) {
    res.status(500).json({ error: 'Rejection failed' });
  }
};

// GET /api/admin/listings/queue
const getListingQueue = async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: { in: ['DRAFT', 'UNDER_REVIEW', 'PENDING'] } },
      include: {
        seller: { include: { businessProfile: true } },
        category: true,
        media: true,
        productDetail: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ queue: listings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listing queue' });
  }
};

const approveListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await prisma.listing.update({
      where: { id },
      data: { status: 'ACTIVE', publishedAt: new Date() },
    });
    res.json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve listing' });
  }
};

const rejectListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await prisma.listing.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
    res.json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject listing' });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { search, limit } = req.query;
    const parsedLimit = parseInt(limit, 10) || 100;

    const where = {};
    if (search && search.trim() !== '') {
      const cleanSearch = search.trim();
      where.OR = [
        { fullName: { contains: cleanSearch, mode: 'insensitive' } },
        { email: { contains: cleanSearch, mode: 'insensitive' } },
        { phone: { contains: cleanSearch, mode: 'insensitive' } },
        { businessProfile: { businessName: { contains: cleanSearch, mode: 'insensitive' } } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      take: parsedLimit,
      orderBy: { createdAt: 'desc' },
      include: {
        businessProfile: true,
        subscription: { include: { plan: true } },
        wallet: true,
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
        _count: {
          select: {
            listings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedCaptains = captains.map((c) => ({
      id: c.id,
      fullName: c.fullName,
      phone: c.phone,
      email: c.email,
      avatarUrl: c.avatarUrl,
      trustScore: c.trustScore,
      isAdmin: c.isAdmin,
      userType: c.userType,
      territory: c.city || 'Pan India',
      status: c.isActive ? 'ACTIVE' : 'INACTIVE',
      totalOnboarded: 4, // Aggregated metrics
      totalSkus: c._count.listings,
      createdAt: c.createdAt,
    }));

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

    let user = await prisma.user.findFirst({
      where: { OR: [{ phone }, ...(email ? [{ email }] : [])] },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          isAdmin: true,
          userType: 'BOTH',
          fullName,
          email: email || user.email,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          fullName,
          phone,
          email: email || null,
          isAdmin: true,
          userType: 'BOTH',
          kycStatus: 'VERIFIED',
          trustScore: 100,
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
    const { search, page = 1, limit = 50 } = req.query;
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

    const [sellers, total] = await Promise.all([
      prisma.user.findMany({
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
      }),
      prisma.user.count({ where }),
    ]);

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
        kycStatus: s.kycStatus,
        storefrontImage: s.avatarUrl,
        documents: s.kycDocuments,
        skuCount: s._count.listings,
        createdAt: s.createdAt,
      };
    });

    res.json({ success: true, onboardings, total });
  } catch (err) {
    logger.error('getAdminCaptainOnboardings error:', err);
    res.status(500).json({ error: 'Failed to fetch captain onboardings' });
  }
};

const getAdminCaptainListings = async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      take: 100,
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

    res.json({ success: true, listings });
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

