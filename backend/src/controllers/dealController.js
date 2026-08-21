const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');
const { sendNotification } = require('../services/notificationService');
const { getAssuredDealFee } = require('../services/entitlementService');

/**
 * POST /api/deals
 * Convert a Lead / RFQ agreement into a formal JaxMart Assured Deal
 */
const createDeal = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const {
      rfqId,
      rfqQuoteId,
      sellerId,
      agreedAmount,
      orderType = 'PRODUCT',
      milestonePlan = [],
      notes,
    } = req.body;

    if (!sellerId || !agreedAmount) {
      return res.status(400).json({ error: 'Seller and agreed amount are required' });
    }

    const feeCalculation = await getAssuredDealFee(sellerId, parseFloat(agreedAmount));

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create underlying Order with escrow milestones
      const newOrder = await tx.order.create({
        data: {
          buyerId,
          sellerId,
          rfqQuoteId: rfqQuoteId || null,
          orderType: orderType.toUpperCase(),
          totalAmount: parseFloat(agreedAmount),
          platformFeeRate: feeCalculation.effectiveFeePct / 100,
          platformFee: feeCalculation.feeAmount,
          sellerPayout: feeCalculation.sellerPayout,
          status: 'CREATED',
          escrowStatus: 'HELD',
          milestones: {
            create: (milestonePlan.length > 0 ? milestonePlan : [
              { title: 'Milestone 1: Production / Preparation', amount: parseFloat(agreedAmount) * 0.5 },
              { title: 'Milestone 2: Final Delivery & Acceptance', amount: parseFloat(agreedAmount) * 0.5 },
            ]).map((m, i) => ({
              title: m.title || `Milestone ${i + 1}`,
              amount: parseFloat(m.amount),
              dueDate: m.dueDate ? new Date(m.dueDate) : null,
              sortOrder: i,
            })),
          },
        },
      });

      // 2. Create Deal referencing Order
      const newDeal = await tx.deal.create({
        data: {
          rfqId: rfqId || null,
          rfqQuoteId: rfqQuoteId || null,
          buyerId,
          sellerId,
          orderId: newOrder.id,
          agreedAmount: parseFloat(agreedAmount),
          assuredDealFeePct: feeCalculation.effectiveFeePct,
          assuredDealFee: feeCalculation.feeAmount,
          status: 'ACCEPTED',
          notes: notes || 'JaxMart Assured Deal created',
        },
        include: {
          buyer: { select: { id: true, fullName: true, phone: true, email: true } },
          seller: { select: { id: true, fullName: true, phone: true, businessProfile: { select: { businessName: true } } } },
          order: { include: { milestones: true } },
        },
      });

      return { deal: newDeal, order: newOrder };
    });

    // Notify seller
    await sendNotification({
      userId: sellerId,
      type: 'ORDER_CREATED',
      title: 'New JaxMart Assured Deal Created!',
      body: `A new Assured Deal of ₹${parseFloat(agreedAmount).toLocaleString('en-IN')} has been initiated. Escrow fee discount of ${feeCalculation.discountPct}% applied for your ${feeCalculation.tierName} plan.`,
      data: { dealId: result.deal.id, orderId: result.order.id },
    });

    res.status(201).json({
      success: true,
      message: 'JaxMart Assured Deal created successfully',
      deal: result.deal,
      order: result.order,
      feeCalculation,
    });
  } catch (err) {
    logger.error('createDeal error:', err);
    res.status(500).json({ error: 'Failed to create deal' });
  }
};

/**
 * GET /api/deals
 * List deals for current user (as buyer or seller)
 */
const getDeals = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role = 'all', page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let where = {};
    if (role === 'buyer') where.buyerId = userId;
    else if (role === 'seller') where.sellerId = userId;
    else where = { OR: [{ buyerId: userId }, { sellerId: userId }] };

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { id: true, fullName: true, avatarUrl: true } },
          seller: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              businessProfile: { select: { businessName: true } },
            },
          },
          order: {
            select: {
              id: true,
              status: true,
              escrowStatus: true,
              paymentStatus: true,
              totalAmount: true,
              platformFee: true,
              sellerPayout: true,
            },
          },
          rfq: { select: { id: true, title: true } },
        },
      }),
      prisma.deal.count({ where }),
    ]);

    res.json({
      success: true,
      deals,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    logger.error('getDeals error:', err);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
};

/**
 * GET /api/deals/:id
 * Retrieve single deal details
 */
const getDealById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            trustScore: true,
          },
        },
        seller: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            trustScore: true,
            businessProfile: { select: { businessName: true, gstin: true } },
          },
        },
        order: {
          include: {
            milestones: { orderBy: { sortOrder: 'asc' } },
            payments: true,
            disputes: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
        rfq: { select: { id: true, title: true, description: true, rfqType: true } },
      },
    });

    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    if (deal.buyerId !== userId && deal.sellerId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({
      success: true,
      deal,
    });
  } catch (err) {
    logger.error('getDealById error:', err);
    res.status(500).json({ error: 'Failed to fetch deal details' });
  }
};

module.exports = {
  createDeal,
  getDeals,
  getDealById,
};
