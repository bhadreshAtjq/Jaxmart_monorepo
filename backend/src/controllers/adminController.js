const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

// GET /api/admin/analytics
const getAnalytics = async (req, res) => {
  try {
    const stats = {
      totalGmv: 1250000,
      activeSellers: await prisma.user.count({ where: { userType: { in: ['SELLER', 'BOTH'] } } }),
      openDisputes: await prisma.dispute.count({ where: { status: 'OPEN' } }),
      kycPending: await prisma.user.count({ where: { kycStatus: 'PENDING' } }),
      listingsPending: await prisma.listing.count({ where: { status: 'DRAFT' } }), // Should be MIGRATED TO REVIEW
      rfqsToday: 42,
      ordersToday: 12
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
      where: { kycStatus: 'PENDING' },
      include: {
        businessProfile: true,
        kycDocuments: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Map to queue format
    const queue = users.map(u => ({
      id: u.id,
      userId: u.id,
      user: u,
      documents: u.kycDocuments,
      createdAt: u.createdAt
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
      data: { kycStatus: 'VERIFIED', trustScore: { increment: 20 } }
    });
    res.json({ message: 'KYC approved' });
  } catch (err) {
    res.status(500).json({ error: 'Approval failed' });
  }
};

// GET /api/admin/listings/queue
const getListingQueue = async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: 'DRAFT' }, // Placeholder for 'UNDER_REVIEW'
      include: {
        seller: { include: { businessProfile: true } },
        category: true,
        media: true
      }
    });
    res.json({ queue: listings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listing queue' });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' }
    });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Mock other endpoints for now
const getDisputes = async (req, res) => res.json({ disputes: [] });
const resolveDispute = async (req, res) => res.json({ message: 'Dispute resolved' });

module.exports = {
  getAnalytics,
  getKycQueue,
  approveKyc,
  getListingQueue,
  getUsers,
  getDisputes,
  resolveDispute
};
