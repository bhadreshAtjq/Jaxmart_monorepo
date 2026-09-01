const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');
const { sendNotification } = require('../services/notificationService');
const { matchProvidersToRfq } = require('../services/matchingService');
const { checkLeadAccess, unlockLead } = require('../services/entitlementService');

/**
 * Mask string helper (e.g., +91 9876543210 -> +91 98**** 3210, email -> t***@example.com)
 */
const maskContactInfo = (user, location) => {
  if (!user) return null;

  const fullName = user.fullName || 'Buyer';
  const nameParts = fullName.split(' ');
  const maskedName = nameParts.length > 1 
    ? `${nameParts[0]} ${nameParts[1].slice(0, 1)}***` 
    : `${fullName.slice(0, 3)}***`;

  let maskedPhone = '+91 ••••• •••••';
  if (user.phone && user.phone.length >= 8) {
    maskedPhone = `${user.phone.slice(0, 4)}••••${user.phone.slice(-3)}`;
  }

  let maskedEmail = '••••@••••.com';
  if (user.email) {
    const [local, domain] = user.email.split('@');
    maskedEmail = `${local.slice(0, 2)}•••@${domain || '••••.com'}`;
  }

  const businessName = user.businessProfile?.businessName
    ? `${user.businessProfile.businessName.slice(0, 4)}•••• ${user.businessProfile.businessType || 'Corp'}`
    : 'Verified Business Buyer';

  return {
    id: user.id,
    fullName: maskedName,
    businessName,
    phone: maskedPhone,
    email: maskedEmail,
    trustScore: user.trustScore,
    isMasked: true,
    maskedCity: location?.city || 'India',
    maskedState: location?.state || '',
  };
};

/**
 * POST /api/rfq
 * Buyer creates a new RFQ (Request for Quotation / Lead)
 */
const createRfq = async (req, res) => {
  try {
    const {
      rfqType = 'PRODUCT',
      title,
      description,
      categoryId,
      quantity,
      unitOfMeasure,
      specifications,
      budgetMin,
      budgetMax,
      deadline,
      locationPreference,
      preferredProviderType,
      visibility = 'PUBLIC',
      attachments = [],
      preferredDeliveryDate,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // Resilient Category Resolution
    let resolvedCategory = null;
    if (categoryId) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
      if (isUUID) {
        resolvedCategory = await prisma.category.findUnique({ where: { id: categoryId } });
      }

      if (!resolvedCategory) {
        // Search by slug or name
        const cleanSlug = categoryId.replace(/^(sub-|cat-)/, '').toLowerCase();
        resolvedCategory = await prisma.category.findFirst({
          where: {
            OR: [
              { slug: categoryId },
              { slug: cleanSlug },
              { name: { contains: cleanSlug.replace(/-/g, ' '), mode: 'insensitive' } },
            ],
          },
        });
      }
    }

    // If still not resolved, match by title keywords
    if (!resolvedCategory && title) {
      const words = title.split(/\s+/).filter((w) => w.length > 2);
      for (const word of words) {
        resolvedCategory = await prisma.category.findFirst({
          where: {
            OR: [
              { name: { contains: word, mode: 'insensitive' } },
              { slug: { contains: word.toLowerCase() } },
            ],
          },
        });
        if (resolvedCategory) break;
      }
    }

    // Default fallback to an active category
    if (!resolvedCategory) {
      resolvedCategory = await prisma.category.findFirst({
        where: { isActive: true, parentId: null },
      });
    }
    if (!resolvedCategory) {
      resolvedCategory = await prisma.category.findFirst({ where: { isActive: true } });
    }

    if (!resolvedCategory) {
      return res.status(400).json({ error: 'Valid category is required' });
    }

    const buyer = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { addresses: { where: { isPrimary: true }, take: 1 } },
    });

    const parsedQty = !isNaN(parseFloat(quantity)) && parseFloat(quantity) > 0 ? parseFloat(quantity) : null;
    const parsedBudgetMin = !isNaN(parseFloat(budgetMin)) ? parseFloat(budgetMin) : null;
    const parsedBudgetMax = !isNaN(parseFloat(budgetMax)) ? parseFloat(budgetMax) : null;
    const parsedDeadline = deadline && !isNaN(Date.parse(deadline)) ? new Date(deadline) : null;
    const parsedDeliveryDate =
      preferredDeliveryDate && !isNaN(Date.parse(preferredDeliveryDate))
        ? new Date(preferredDeliveryDate)
        : null;

    const rfq = await prisma.rfqRequest.create({
      data: {
        buyerId: req.user.id,
        rfqType: ['PRODUCT', 'SERVICE'].includes(rfqType?.toUpperCase()) ? rfqType.toUpperCase() : 'PRODUCT',
        title,
        description,
        categoryId: resolvedCategory.id,
        quantity: parsedQty,
        unitOfMeasure: unitOfMeasure || 'Pieces',
        specifications: specifications || {},
        locationId: buyer?.addresses[0]?.id || null,
        budgetMin: parsedBudgetMin,
        budgetMax: parsedBudgetMax,
        deadline: parsedDeadline,
        preferredDeliveryDate: parsedDeliveryDate,
        locationPreference: locationPreference || buyer?.addresses[0]?.city || 'Pan India',
        preferredProviderType: ['INDIVIDUAL', 'BUSINESS'].includes(preferredProviderType?.toUpperCase())
          ? preferredProviderType.toUpperCase()
          : null,
        visibility: ['PUBLIC', 'INVITE_ONLY'].includes(visibility?.toUpperCase())
          ? visibility.toUpperCase()
          : 'PUBLIC',
        attachments: attachments || [],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        location: { select: { city: true, state: true } },
        buyer: { select: { id: true, fullName: true, trustScore: true } },
      },
    });

    // Notify matching sellers asynchronously
    matchProvidersToRfq(rfq).catch((err) => {
      logger.error('RFQ matching failed:', err);
    });

    res.status(201).json({
      success: true,
      message: 'RFQ posted successfully! Matched verified suppliers are being notified.',
      rfq,
    });
  } catch (err) {
    logger.error('createRfq error:', err);
    res.status(500).json({ error: err.message || 'Failed to create RFQ' });
  }
};

/**
 * GET /api/rfq/my
 * Buyer views their own submitted RFQs with quote counts and leads status
 */
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
          category: { select: { id: true, name: true, slug: true } },
          quotes: {
            include: {
              seller: {
                select: {
                  id: true,
                  fullName: true,
                  trustScore: true,
                  sellerRating: true,
                  kycStatus: true,
                  businessProfile: { select: { businessName: true } },
                },
              },
            },
            orderBy: { submittedAt: 'desc' },
          },
          _count: { select: { quotes: true, leadUnlocks: true } },
        },
      }),
      prisma.rfqRequest.count({ where }),
    ]);

    res.json({ rfqs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    logger.error('getMyRfqs error:', err);
    res.status(500).json({ error: 'Failed to fetch RFQs' });
  }
};

/**
 * GET /api/rfq/seller/inbox
 * Seller views leads matched to their profile with contact masking/unlock flags
 */
const getSellerRfqInbox = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { page = 1, limit = 20, rfqType, search, matchOnly = 'false', categoryId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let categoryIds = [];
    if (matchOnly === 'true') {
      const sellerCategories = await prisma.listing.findMany({
        where: { sellerId, status: 'ACTIVE' },
        select: { categoryId: true },
        distinct: ['categoryId'],
      });
      categoryIds = sellerCategories.map(l => l.categoryId);
    }

    const where = {
      status: 'OPEN',
      expiresAt: { gt: new Date() },
      ...(categoryId && { categoryId }),
      ...(matchOnly === 'true' && categoryIds.length > 0 && { categoryId: { in: categoryIds } }),
      ...(rfqType && { rfqType: rfqType.toUpperCase() }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [rfqs, total] = await Promise.all([
      prisma.rfqRequest.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          location: { select: { city: true, state: true } },
          buyer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              trustScore: true,
              kycStatus: true,
              avatarUrl: true,
              businessProfile: { select: { businessName: true, businessType: true } },
            },
          },
          quotes: {
            where: { sellerId },
            select: { id: true, quotedAmount: true, status: true, submittedAt: true },
          },
          _count: { select: { quotes: true } },
        },
      }),
      prisma.rfqRequest.count({ where }),
    ]);

    // Check unlocks for each RFQ for this seller
    const rfqsWithEntitlements = await Promise.all(
      rfqs.map(async (rfq) => {
        const access = await checkLeadAccess(sellerId, rfq.id);
        const hasQuoted = rfq.quotes.length > 0;

        if (access.isUnlocked || hasQuoted) {
          return {
            ...rfq,
            isUnlocked: true,
            unlockedVia: access.unlockedVia || (hasQuoted ? 'QUOTE_SUBMITTED' : 'PLAN'),
            buyer: {
              ...rfq.buyer,
              isMasked: false,
              businessName: rfq.buyer.businessProfile?.businessName || rfq.buyer.fullName,
            },
          };
        } else {
          return {
            ...rfq,
            isUnlocked: false,
            buyer: maskContactInfo(rfq.buyer, rfq.location),
          };
        }
      })
    );

    res.json({
      success: true,
      rfqs: rfqsWithEntitlements,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    logger.error('getSellerRfqInbox error:', err);
    res.status(500).json({ error: 'Failed to fetch RFQ inbox' });
  }
};

/**
 * GET /api/rfq
 * Public feed of active open buyer RFQs for the Live RFQ Board / Marketplace
 */
const getPublicRfqs = async (req, res) => {
  try {
    const { page = 1, limit = 20, rfqType, search, categoryId, status = 'OPEN' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const userId = req.user?.id;

    const where = {
      status: status.toUpperCase() === 'ALL' ? undefined : status.toUpperCase(),
      ...(status.toUpperCase() === 'OPEN' && { expiresAt: { gt: new Date() } }),
      ...(categoryId && { categoryId }),
      ...(rfqType && { rfqType: rfqType.toUpperCase() }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [rfqs, total] = await Promise.all([
      prisma.rfqRequest.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          location: { select: { city: true, state: true } },
          buyer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              trustScore: true,
              kycStatus: true,
              avatarUrl: true,
              businessProfile: { select: { businessName: true, businessType: true } },
            },
          },
          _count: { select: { quotes: true } },
        },
      }),
      prisma.rfqRequest.count({ where }),
    ]);

    const formattedRfqs = await Promise.all(
      rfqs.map(async (rfq) => {
        const isOwner = userId && rfq.buyerId === userId;
        let isUnlocked = isOwner;

        if (!isUnlocked && userId) {
          const access = await checkLeadAccess(userId, rfq.id);
          if (access.isUnlocked) isUnlocked = true;
        }

        if (isUnlocked) {
          return {
            ...rfq,
            isUnlocked: true,
            isOwner,
            buyer: {
              ...rfq.buyer,
              isMasked: false,
              businessName: rfq.buyer.businessProfile?.businessName || rfq.buyer.fullName,
            },
          };
        } else {
          return {
            ...rfq,
            isUnlocked: false,
            isOwner: false,
            buyer: maskContactInfo(rfq.buyer, rfq.location),
          };
        }
      })
    );

    res.json({
      success: true,
      rfqs: formattedRfqs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    logger.error('getPublicRfqs error:', err);
    res.status(500).json({ error: 'Failed to fetch RFQ board' });
  }
};

/**
 * GET /api/rfq/:id
 * Retrieve single RFQ details
 */
const getRfq = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const rfq = await prisma.rfqRequest.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            trustScore: true,
            kycStatus: true,
            avatarUrl: true,
            businessProfile: { select: { businessName: true, businessType: true, gstin: true } },
          },
        },
        category: true,
        location: true,
        quotes: {
          include: {
            seller: {
              select: {
                id: true,
                fullName: true,
                trustScore: true,
                sellerRating: true,
                kycStatus: true,
                businessProfile: { select: { businessName: true } },
              },
            },
            order: { select: { id: true, status: true, escrowStatus: true } },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });

    if (!userId) {
      rfq.buyer = maskContactInfo(rfq.buyer, rfq.location);
      rfq.quotes = [];
      return res.json({ ...rfq, isUnlocked: false, isOwner: false });
    }

    const isBuyer = rfq.buyerId === userId;
    const hasQuote = rfq.quotes.some(q => q.sellerId === userId);

    if (isBuyer) {
      return res.json({ ...rfq, isOwner: true, isUnlocked: true });
    }

    // Filter quotes: sellers only see their own quote
    rfq.quotes = rfq.quotes.filter(q => q.sellerId === userId);

    const access = await checkLeadAccess(userId, rfq.id);
    if (!access.isUnlocked && !hasQuote) {
      rfq.buyer = maskContactInfo(rfq.buyer, rfq.location);
      return res.json({ ...rfq, isUnlocked: false, isOwner: false });
    }

    res.json({
      ...rfq,
      isUnlocked: true,
      unlockedVia: access.unlockedVia || 'QUOTE_SUBMITTED',
      isOwner: false,
    });
  } catch (err) {
    logger.error('getRfq error:', err);
    res.status(500).json({ error: 'Failed to fetch RFQ' });
  }
};

/**
 * POST /api/rfq/:id/quotes
 * Seller submits quote on an RFQ (unlocks contact if not yet unlocked)
 */
const submitQuote = async (req, res) => {
  try {
    const { id: rfqId } = req.params;
    const sellerId = req.user.id;
    const {
      quotedAmount,
      proposalText,
      milestonePlan = [],
      timelineDays = 7,
      listingId,
      variantId,
      paymentTerms,
      deliveryTerms,
    } = req.body;

    const rfq = await prisma.rfqRequest.findUnique({ where: { id: rfqId } });
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });
    if (rfq.status !== 'OPEN') return res.status(400).json({ error: 'RFQ is no longer open' });
    if (rfq.buyerId === sellerId) return res.status(400).json({ error: 'Cannot quote on your own RFQ' });

    const existingQuote = await prisma.rfqQuote.findFirst({
      where: { rfqId, sellerId },
    });
    if (existingQuote) {
      return res.status(400).json({ error: 'You have already submitted a quote for this RFQ' });
    }

    // Ensure lead is unlocked
    let leadCreditUsed = false;
    const access = await checkLeadAccess(sellerId, rfqId);
    if (!access.isUnlocked) {
      try {
        await unlockLead(sellerId, rfqId);
        leadCreditUsed = true;
      } catch (err) {
        // Allow quoting even if free quota is used up, but flag leadCreditUsed
        logger.warn(`Seller ${sellerId} quoting without unlocked lead: ${err.message}`);
      }
    }

    const quote = await prisma.rfqQuote.create({
      data: {
        rfqId,
        sellerId,
        listingId: listingId || null,
        variantId: variantId || null,
        quotedAmount: parseFloat(quotedAmount),
        proposalText: proposalText || 'Standard proposal submitted',
        milestonePlan: milestonePlan.length > 0 ? milestonePlan : [
          { title: 'Milestone 1: Order Confirmation & Production', amount: parseFloat(quotedAmount) * 0.5 },
          { title: 'Milestone 2: Final Quality Check & Delivery', amount: parseFloat(quotedAmount) * 0.5 },
        ],
        timelineDays: parseInt(timelineDays),
        paymentTerms,
        deliveryTerms,
        leadCreditUsed,
      },
    });

    await prisma.rfqRequest.update({
      where: { id: rfqId },
      data: { quotesCount: { increment: 1 } },
    });

    // Notify buyer of new quote
    await sendNotification({
      userId: rfq.buyerId,
      type: 'QUOTE_RECEIVED',
      title: 'New Quote Received!',
      body: `You received a quote of ₹${parseFloat(quotedAmount).toLocaleString('en-IN')} for "${rfq.title}"`,
      data: { rfqId, quoteId: quote.id },
    });

    res.status(201).json({
      success: true,
      message: 'Quote submitted successfully',
      quote,
    });
  } catch (err) {
    logger.error('submitQuote error:', err);
    res.status(500).json({ error: 'Failed to submit quote' });
  }
};

/**
 * PATCH /api/rfq/:id/award/:quoteId
 * Buyer awards quote to seller and initiates Assured Deal / Order
 */
const awardQuote = async (req, res) => {
  try {
    const { id: rfqId, quoteId } = req.params;

    const rfq = await prisma.rfqRequest.findUnique({ where: { id: rfqId } });
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });
    if (rfq.buyerId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const quote = await prisma.rfqQuote.findUnique({
      where: { id: quoteId },
      include: { seller: { include: { subscription: { include: { plan: true } } } } },
    });
    if (!quote || quote.rfqId !== rfqId) return res.status(404).json({ error: 'Quote not found' });

    // Calculate discounted platform fee
    const discountPct = quote.seller?.subscription?.plan?.assuredDealFeeDiscountPct || 0;
    const baseFeePct = 5.0;
    const effectiveFeePct = Number((baseFeePct * (1 - discountPct / 100)).toFixed(2));
    const platformFee = Number(((quote.quotedAmount * effectiveFeePct) / 100).toFixed(2));
    const sellerPayout = Number((quote.quotedAmount - platformFee).toFixed(2));

    const { order, deal } = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          buyerId: req.user.id,
          sellerId: quote.sellerId,
          rfqQuoteId: quoteId,
          orderType: rfq.rfqType,
          totalAmount: quote.quotedAmount,
          platformFeeRate: effectiveFeePct / 100,
          platformFee,
          sellerPayout,
          status: 'CREATED',
          escrowStatus: 'HELD',
          milestones: {
            create: (quote.milestonePlan?.length > 0 ? quote.milestonePlan : [{ title: 'Full delivery', amount: quote.quotedAmount }]).map(
              (m, i) => ({
                title: m.title || `Milestone ${i + 1}`,
                amount: parseFloat(m.amount),
                dueDate: m.dueDate ? new Date(m.dueDate) : null,
                sortOrder: i,
              })
            ),
          },
        },
      });

      const newDeal = await tx.deal.create({
        data: {
          rfqId,
          rfqQuoteId: quoteId,
          buyerId: req.user.id,
          sellerId: quote.sellerId,
          orderId: newOrder.id,
          agreedAmount: quote.quotedAmount,
          assuredDealFeePct: effectiveFeePct,
          assuredDealFee: platformFee,
          status: 'ACCEPTED',
          notes: `Deal created from RFQ #${rfq.id.substring(0, 8)}`,
        },
      });

      await tx.rfqQuote.update({ where: { id: quoteId }, data: { status: 'WON' } });
      await tx.rfqQuote.updateMany({
        where: { rfqId, id: { not: quoteId } },
        data: { status: 'LOST' },
      });
      await tx.rfqRequest.update({ where: { id: rfqId }, data: { status: 'AWARDED' } });

      return { order: newOrder, deal: newDeal };
    });

    // Notify seller
    await sendNotification({
      userId: quote.sellerId,
      type: 'QUOTE_AWARDED',
      title: 'Congratulations! Quote Awarded',
      body: `Your quote for "${rfq.title}" has been accepted. JaxMart Assured Deal protection is now active.`,
      data: { orderId: order.id, dealId: deal.id, rfqId },
    });

    res.json({
      success: true,
      message: 'Quote awarded and JaxMart Assured Deal created',
      orderId: order.id,
      dealId: deal.id,
      deal,
      order,
    });
  } catch (err) {
    logger.error('awardQuote error:', err);
    res.status(500).json({ error: 'Failed to award quote' });
  }
};

/**
 * PATCH /api/rfq/quotes/:quoteId/shortlist
 */
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
      title: 'Quote Shortlisted!',
      body: `The buyer shortlisted your quote for "${quote.rfq.title}". Prepare for negotiations.`,
      data: { rfqId: quote.rfqId, quoteId },
    });

    res.json({ success: true, message: 'Quote shortlisted' });
  } catch (err) {
    logger.error('shortlistQuote error:', err);
    res.status(500).json({ error: 'Failed to shortlist quote' });
  }
};

/**
 * GET /api/rfq/:id/notified-sellers
 */
const getRfqNotifiedSellers = async (req, res) => {
  try {
    const { id } = req.params;

    const rfq = await prisma.rfqRequest.findUnique({
      where: { id },
      select: { buyerId: true },
    });

    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });
    if (rfq.buyerId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const notifs = await prisma.notification.findMany({
      where: { type: 'RFQ_MATCH' },
      include: { user: { select: { fullName: true, businessProfile: { select: { businessName: true } } } } },
    });

    const matchingNotifs = notifs.filter((n) => n.data && n.data.rfqId === id);

    const notifiedSellers = matchingNotifs.map((n) => ({
      name: n.user.fullName,
      business: n.user.businessProfile?.businessName || 'Verified Supplier',
    }));

    res.json({ notifiedSellers });
  } catch (err) {
    logger.error('getRfqNotifiedSellers error:', err);
    res.status(500).json({ error: 'Failed to fetch notified sellers' });
  }
};

module.exports = {
  createRfq,
  getMyRfqs,
  getSellerRfqInbox,
  getPublicRfqs,
  getRfq,
  submitQuote,
  awardQuote,
  shortlistQuote,
  getRfqNotifiedSellers,
};