const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');
const { sendNotification } = require('../services/notificationService');
const { matchProvidersToRfq } = require('../services/matchingService');

// POST /api/rfq
const createRfq = async (req, res) => {
  try {
    const {
      rfqType, title, description, categoryId,
      budgetMin, budgetMax, deadline,
      locationPreference, preferredProviderType,
      isPublic, attachments,
    } = req.body;

    const buyer = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { addresses: { where: { isPrimary: true }, take: 1 } },
    });

    const rfq = await prisma.rfqRequest.create({
      data: {
        buyerId: req.user.id,
        rfqType: (rfqType || 'PRODUCT').toUpperCase(),
        title,
        description,
        categoryId,
        locationId: buyer.addresses[0]?.id || null,
        budgetMin: budgetMin ? parseFloat(budgetMin) : null,
        budgetMax: budgetMax ? parseFloat(budgetMax) : null,
        deadline: deadline ? new Date(deadline) : null,
        locationPreference,
        preferredProviderType: preferredProviderType?.toUpperCase() || null,
        isPublic: isPublic || false,
        attachments: attachments || [],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      include: {
        category: { select: { name: true } },
        location: { select: { city: true, state: true } },
      },
    });

    // AI matching — find and notify relevant providers
    matchProvidersToRfq(rfq).catch((err) =>
      logger.error('RFQ matching failed:', err)
    );

    res.status(201).json(rfq);
  } catch (err) {
    logger.error('createRfq error:', err);
    res.status(500).json({ error: 'Failed to create RFQ' });
  }
};

// GET /api/rfq (buyer's own RFQs)
const getMyRfqs = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      buyerId: req.user.id,
      ...(status && { status: status.toUpperCase() }),
    };

    const [rfqs, total] = await Promise.all([
      prisma.rfqRequest.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true } },
          _count: { select: { quotes: true } },
        },
      }),
      prisma.rfqRequest.count({ where }),
    ]);

    res.json({ rfqs, total, page: parseInt(page) });
  } catch (err) {
    logger.error('getMyRfqs error:', err);
    res.status(500).json({ error: 'Failed to fetch RFQs' });
  }
};

// GET /api/rfq/:id
const getRfq = async (req, res) => {
  try {
    const { id } = req.params;
    const rfq = await prisma.rfqRequest.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, fullName: true, trustScore: true } },
        category: true,
        location: true,
        quotes: {
          include: {
            seller: {
              select: {
                id: true, fullName: true, trustScore: true, kycStatus: true,
                businessProfile: { select: { businessName: true } },
              },
            },
            order: { select: { id: true } },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });

    // Filter quotes based on who is asking
    const isOwner = rfq.buyerId === req.user.id;
    if (!isOwner) {
      // Non-owners (sellers) only see their own quote
      rfq.quotes = rfq.quotes.filter(q => q.sellerId === req.user.id);
    }

    // Authorization: Buyer, already quoted, public RFQ, or matched category seller
    const isBuyer = rfq.buyerId === req.user.id;
    const hasQuote = rfq.quotes.some(q => q.sellerId === req.user.id);
    
    let isMatchedSeller = false;
    if (!isBuyer && !rfq.isPublic && !hasQuote && req.user.userType !== 'BUYER') {
      const match = await prisma.listing.findFirst({
        where: { sellerId: req.user.id, categoryId: rfq.categoryId, status: 'ACTIVE' }
      });
      if (match) isMatchedSeller = true;
    }

    if (!isBuyer && !rfq.isPublic && !hasQuote && !isMatchedSeller) {
      return res.status(403).json({ error: 'Not authorized to view this RFQ' });
    }

    res.json(rfq);
  } catch (err) {
    logger.error('getRfq error:', err);
    res.status(500).json({ error: 'Failed to fetch RFQ' });
  }
};

// GET /api/rfq/seller/inbox (RFQs matched to seller)
const getSellerRfqInbox = async (req, res) => {
  try {
    const { page = 1, limit = 20, rfqType, search, matchOnly = 'false' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find categories this seller lists in (for matching)
    let categoryIds = [];
    if (matchOnly === 'true') {
      const sellerCategories = await prisma.listing.findMany({
        where: { sellerId: req.user.id, status: 'ACTIVE' },
        select: { categoryId: true },
        distinct: ['categoryId'],
      });
      categoryIds = sellerCategories.map(l => l.categoryId);
    }

    const where = {
      status: 'OPEN',
      expiresAt: { gt: new Date() },
      ...(matchOnly === 'true' && { categoryId: { in: categoryIds } }),
      ...(rfqType && { rfqType: rfqType.toUpperCase() }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      quotes: { none: { sellerId: req.user.id } }, // Not yet quoted
    };

    const [rfqs, total] = await Promise.all([
      prisma.rfqRequest.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true } },
          location: { select: { city: true, state: true } },
          buyer: { select: { fullName: true, avatarUrl: true } },
          _count: { select: { quotes: true } },
        },
      }),
      prisma.rfqRequest.count({ where }),
    ]);

    res.json({ rfqs, total, page: parseInt(page) });
  } catch (err) {
    logger.error('getSellerRfqInbox error:', err);
    res.status(500).json({ error: 'Failed to fetch RFQ inbox' });
  }
};

// POST /api/rfq/:id/quotes
const submitQuote = async (req, res) => {
  try {
    const { id: rfqId } = req.params;
    const { quotedAmount, proposalText, milestonePlan, timelineDays, listingId } = req.body;

    const rfq = await prisma.rfqRequest.findUnique({ where: { id: rfqId } });
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });
    if (rfq.status !== 'OPEN') return res.status(400).json({ error: 'RFQ is no longer open' });
    if (rfq.buyerId === req.user.id) return res.status(400).json({ error: 'Cannot quote on own RFQ' });

    // Check existing quote
    const existing = await prisma.rfqQuote.findFirst({
      where: { rfqId, sellerId: req.user.id },
    });
    if (existing) return res.status(400).json({ error: 'Already submitted a quote' });

    const quote = await prisma.rfqQuote.create({
      data: {
        rfqId,
        sellerId: req.user.id,
        listingId: listingId || null,
        quotedAmount: parseFloat(quotedAmount),
        proposalText,
        milestonePlan: milestonePlan || [],
        timelineDays: parseInt(timelineDays),
      },
    });

    // Update quote count on RFQ
    await prisma.rfqRequest.update({
      where: { id: rfqId },
      data: { quotesCount: { increment: 1 } },
    });

    // Notify buyer
    await sendNotification({
      userId: rfq.buyerId,
      type: 'QUOTE_RECEIVED',
      title: 'New quote received',
      body: `You have a new quote for your RFQ: "${rfq.title}"`,
      data: { rfqId, quoteId: quote.id },
    });

    res.status(201).json(quote);
  } catch (err) {
    logger.error('submitQuote error:', err);
    res.status(500).json({ error: 'Failed to submit quote' });
  }
};

// PATCH /api/rfq/:id/award/:quoteId
const awardQuote = async (req, res) => {
  try {
    const { id: rfqId, quoteId } = req.params;

    const rfq = await prisma.rfqRequest.findUnique({ where: { id: rfqId } });
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });
    if (rfq.buyerId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const quote = await prisma.rfqQuote.findUnique({ where: { id: quoteId } });
    if (!quote || quote.rfqId !== rfqId) return res.status(404).json({ error: 'Quote not found' });

    const platformFeeRate = 0.05; // 5%
    const platformFee = quote.quotedAmount * platformFeeRate;
    const sellerPayout = quote.quotedAmount - platformFee;

    // Create order
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          buyerId: req.user.id,
          sellerId: quote.sellerId,
          rfqQuoteId: quoteId,
          orderType: rfq.rfqType,
          totalAmount: quote.quotedAmount,
          platformFee,
          sellerPayout,
          status: 'CREATED',
          escrowStatus: 'HELD',
          milestones: {
            create: (quote.milestonePlan?.length > 0 ? quote.milestonePlan : [{ title: 'Full delivery', amount: quote.quotedAmount }]).map(
              (m, i) => ({
                title: m.title,
                amount: parseFloat(m.amount),
                dueDate: m.dueDate ? new Date(m.dueDate) : null,
                sortOrder: i,
              })
            ),
          },
        },
      });

      await tx.rfqQuote.update({ where: { id: quoteId }, data: { status: 'WON' } });
      await tx.rfqQuote.updateMany({
        where: { rfqId, id: { not: quoteId } },
        data: { status: 'LOST' },
      });
      await tx.rfqRequest.update({ where: { id: rfqId }, data: { status: 'AWARDED' } });

      return newOrder;
    }, {
      maxWait: 5000,
      timeout: 20000
    });

    // Notify seller
    await sendNotification({
      userId: quote.sellerId,
      type: 'QUOTE_AWARDED',
      title: 'Quote awarded!',
      body: `Your quote for "${rfq.title}" has been awarded. Proceed to contract signing.`,
      data: { orderId: order.id, rfqId },
    });

    res.json({ message: 'Quote awarded', orderId: order.id, order });
  } catch (err) {
    logger.error('awardQuote error:', err);
    res.status(500).json({ error: 'Failed to award quote' });
  }
};

// PATCH /api/rfq/quotes/:quoteId/shortlist
const shortlistQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const quote = await prisma.rfqQuote.findUnique({
      where: { id: quoteId },
      include: { rfq: true },
    });
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    if (quote.rfq.buyerId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    await prisma.rfqQuote.update({
      where: { id: quoteId },
      data: { status: 'SHORTLISTED' },
    });

    await sendNotification({
      userId: quote.sellerId,
      type: 'QUOTE_SHORTLISTED',
      title: 'Your quote was shortlisted!',
      body: 'The buyer has shortlisted your quote. Stay ready for next steps.',
      data: { rfqId: quote.rfqId, quoteId },
    });

    res.json({ message: 'Quote shortlisted' });
  } catch (err) {
    logger.error('shortlistQuote error:', err);
    res.status(500).json({ error: 'Failed to shortlist' });
  }
};

module.exports = {
  createRfq, getMyRfqs, getRfq, getSellerRfqInbox,
  submitQuote, awardQuote, shortlistQuote,
};
