const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');
const { sendNotification } = require('../services/notificationService');

// GET /api/orders (buyer or seller)
const getOrders = async (req, res) => {
  try {
    const { status, role = 'buyer', page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(role === 'buyer' ? { buyerId: req.user.id } : { sellerId: req.user.id }),
      ...(status && { status: status.toUpperCase() }),
    };

    console.log(`[DEBUG] getOrders: user=${req.user.id} role=${role} where=${JSON.stringify(where)}`);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { id: true, fullName: true, avatarUrl: true } },
          seller: {
            select: {
              id: true, fullName: true, avatarUrl: true,
              businessProfile: { select: { businessName: true } },
            },
          },
          milestones: { orderBy: { sortOrder: 'asc' } },
          rfqQuote: { 
            include: {
               rfq: { select: { title: true } }
            }
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    console.log(`[DEBUG] getOrders: found ${orders.length} orders, total ${total}`);

    res.json({ orders, total, page: parseInt(page) });
  } catch (err) {
    logger.error('getOrders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// GET /api/orders/:id
const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, fullName: true, phone: true, avatarUrl: true } },
        seller: {
          select: {
            id: true, fullName: true, phone: true, avatarUrl: true,
            businessProfile: { select: { businessName: true, gstin: true } },
          },
        },
        milestones: { orderBy: { sortOrder: 'asc' } },
        rfqQuote: {
          include: {
            rfq: { select: { title: true, description: true, rfqType: true } },
          },
        },
        reviews: {
          include: {
            reviewer: { select: { id: true, fullName: true } },
          },
        },
        disputes: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyerId !== req.user.id && order.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(order);
  } catch (err) {
    logger.error('getOrder error:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// POST /api/orders/:id/contract-sign
const signContract = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const isParty = [order.buyerId, order.sellerId].includes(req.user.id);
    if (!isParty) return res.status(403).json({ error: 'Not authorized' });

    await prisma.order.update({
      where: { id },
      data: { contractSignedAt: new Date(), status: 'ACTIVE' },
    });

    const otherId = order.buyerId === req.user.id ? order.sellerId : order.buyerId;
    await sendNotification({
      userId: otherId,
      type: 'ORDER_CREATED',
      title: 'Contract signed — work begins!',
      body: 'Both parties have signed. The project is now active.',
      data: { orderId: id },
    });

    res.json({ message: 'Contract signed. Order is now active.' });
  } catch (err) {
    logger.error('signContract error:', err);
    res.status(500).json({ error: 'Failed to sign contract' });
  }
};

// POST /api/orders/:orderId/milestones/:milestoneId/submit
const submitMilestone = async (req, res) => {
  try {
    const { orderId, milestoneId } = req.params;
    const { submissionNote, submissionFiles } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.sellerId !== req.user.id) return res.status(403).json({ error: 'Only seller can submit milestones' });
    
    if (milestoneId === 'FULL') {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'SHIPPED' },
      });
    } else {
      await prisma.milestone.update({
        where: { id: milestoneId },
        data: {
          status: 'SUBMITTED',
          submissionNote,
          submissionFiles: submissionFiles || [],
        },
      });
    }

    await sendNotification({
      userId: order.buyerId,
      type: 'MILESTONE_SUBMITTED',
      title: 'Order shipped / Milestone submitted',
      body: 'Your seller has updated the fulfillment status. Please review.',
      data: { orderId, milestoneId },
    });

    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    logger.error('submitMilestone error:', err);
    res.status(500).json({ error: 'Failed to update milestone' });
  }
};

// POST /api/orders/:orderId/milestones/:milestoneId/approve
const approveMilestone = async (req, res) => {
  try {
    const { orderId, milestoneId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { milestones: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyerId !== req.user.id) return res.status(403).json({ error: 'Only buyer can approve milestones' });

    if (milestoneId === 'FULL') {
      await prisma.order.update({
        where: { id: orderId },
        data: {
           status: 'COMPLETED',
           escrowStatus: 'FULLY_RELEASED',
           completedAt: new Date(),
        },
      });
      return res.json({ message: 'Order completed and payment released', orderCompleted: true });
    }

    const milestone = order.milestones.find(m => m.id === milestoneId);
    if (!milestone) return res.status(404).json({ error: 'Milestone not found' });
    if (milestone.status !== 'SUBMITTED') {
      return res.status(400).json({ error: 'Milestone must be submitted before approving' });
    }

    // Release escrow for this milestone
    const allApprovedAfter = order.milestones.every(m =>
      m.id === milestoneId ? true : m.status === 'RELEASED'
    );

    await prisma.$transaction(async (tx) => {
      await tx.milestone.update({
        where: { id: milestoneId },
        data: { status: 'RELEASED', releasedAt: new Date() },
      });

      if (allApprovedAfter) {
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'COMPLETED',
            escrowStatus: 'FULLY_RELEASED',
            completedAt: new Date(),
          },
        });
      } else {
        await tx.order.update({
          where: { id: orderId },
          data: { escrowStatus: 'PARTIAL_RELEASED' },
        });
      }
    }, {
      maxWait: 5000,
      timeout: 15000
    });

    await sendNotification({
      userId: order.sellerId,
      type: 'MILESTONE_APPROVED',
      title: 'Milestone approved!',
      body: `Payment of ₹${milestone.amount.toLocaleString('en-IN')} has been released to your account.`,
      data: { orderId, milestoneId },
    });

    res.json({
      message: 'Milestone approved and payment released',
      orderCompleted: allApprovedAfter,
    });
  } catch (err) {
    logger.error('approveMilestone error:', err);
    res.status(500).json({ error: 'Failed to approve milestone' });
  }
};

// POST /api/orders/:orderId/disputes
const raiseDispute = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { milestoneId, reason, description } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const isParty = [order.buyerId, order.sellerId].includes(req.user.id);
    if (!isParty) return res.status(403).json({ error: 'Not authorized' });

    // Freeze escrow for disputed milestone
    if (milestoneId) {
      await prisma.milestone.update({
        where: { id: milestoneId },
        data: { status: 'DISPUTED' },
      });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'DISPUTED', escrowStatus: 'FROZEN' },
    });

    const dispute = await prisma.dispute.create({
      data: {
        orderId,
        milestoneId: milestoneId || null,
        raisedById: req.user.id,
        reason,
        description,
      },
    });

    // Notify other party
    const otherId = order.buyerId === req.user.id ? order.sellerId : order.buyerId;
    await sendNotification({
      userId: otherId,
      type: 'DISPUTE_OPENED',
      title: 'A dispute has been raised',
      body: 'A dispute has been opened on your order. Please submit your evidence within 48 hours.',
      data: { orderId, disputeId: dispute.id },
    });

    res.status(201).json(dispute);
  } catch (err) {
    logger.error('raiseDispute error:', err);
    res.status(500).json({ error: 'Failed to raise dispute' });
  }
};

// GET /api/orders/:orderId/dashboard (seller analytics)
const getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [activeOrders, pendingQuotes, monthlyRevenue, totalRevenue] = await Promise.all([
      prisma.order.count({ where: { sellerId, status: 'ACTIVE' } }),
      prisma.rfqQuote.count({ where: { sellerId, status: 'SUBMITTED' } }),
      prisma.order.aggregate({
        where: { sellerId, status: 'COMPLETED', completedAt: { gte: startOfMonth } },
        _sum: { sellerPayout: true },
      }),
      prisma.order.aggregate({
        where: { sellerId, status: 'COMPLETED' },
        _sum: { sellerPayout: true },
      }),
    ]);

    const recentOrders = await prisma.order.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        buyer: { select: { fullName: true } },
        milestones: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
    });

    res.json({
      stats: {
        activeOrders,
        pendingQuotes,
        monthlyRevenue: monthlyRevenue._sum.sellerPayout || 0,
        totalRevenue: totalRevenue._sum.sellerPayout || 0,
      },
      recentOrders,
    });
  } catch (err) {
    logger.error('getSellerDashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
};

module.exports = {
  getOrders, getOrder, signContract,
  submitMilestone, approveMilestone,
  raiseDispute, getSellerDashboard,
};
