const { GraphQLError } = require('graphql');
const { GraphQLJSON } = require('graphql-type-json');

const resolvers = {
  JSON: GraphQLJSON,

  // ─── QUERIES ────────────────────────────────────────────────────────────────

  Query: {
    me: async (_, __, { prisma, user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      return prisma.user.findUnique({ where: { id: user.id } });
    },

    user: async (_, { id }, { prisma }) => {
      const u = await prisma.user.findUnique({ where: { id } });
      if (!u) throw new GraphQLError('User not found', { extensions: { code: 'NOT_FOUND' } });
      return u;
    },

    users: async (_, { limit = 20, offset = 0 }, { prisma }) => {
      return prisma.user.findMany({ take: limit, skip: offset, orderBy: { createdAt: 'desc' } });
    },

    categories: async (_, { parentId }, { prisma }) => {
      return prisma.category.findMany({
        where: { parentId: parentId || null },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
      });
    },

    category: async (_, { id }, { prisma }) => {
      const c = await prisma.category.findUnique({ where: { id } });
      if (!c) throw new GraphQLError('Category not found', { extensions: { code: 'NOT_FOUND' } });
      return c;
    },

    categoryAttributes: async (_, { categoryId }, { prisma }) => {
      return prisma.categoryAttribute.findMany({
        where: { categoryId },
        orderBy: { sortOrder: 'asc' }
      });
    },

    listings: async (_, { categoryId, listingType, status, limit = 20, offset = 0, search }, { prisma }) => {
      const where = {};
      if (categoryId) where.categoryId = categoryId;
      if (listingType) where.listingType = listingType;
      if (status) where.status = status;
      else where.status = 'ACTIVE';
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }
      return prisma.listing.findMany({ where, take: limit, skip: offset, orderBy: { createdAt: 'desc' } });
    },

    listing: async (_, { id }, { prisma }) => {
      const l = await prisma.listing.findUnique({ where: { id } });
      if (!l) throw new GraphQLError('Listing not found', { extensions: { code: 'NOT_FOUND' } });
      return l;
    },

    productVariants: async (_, { listingId }, { prisma }) => {
      return prisma.productVariant.findMany({
        where: { listingId, isActive: true },
        orderBy: { sortOrder: 'asc' }
      });
    },

    rfqRequests: async (_, { status, limit = 20, offset = 0 }, { prisma }) => {
      const where = {};
      if (status) where.status = status;
      return prisma.rfqRequest.findMany({ where, take: limit, skip: offset, orderBy: { createdAt: 'desc' } });
    },

    rfqRequest: async (_, { id }, { prisma }) => {
      const r = await prisma.rfqRequest.findUnique({ where: { id } });
      if (!r) throw new GraphQLError('RFQ not found', { extensions: { code: 'NOT_FOUND' } });
      return r;
    },

    rfqQuotes: async (_, { rfqId }, { prisma }) => {
      return prisma.rfqQuote.findMany({ where: { rfqId }, orderBy: { submittedAt: 'desc' } });
    },

    rfqQuote: async (_, { id }, { prisma }) => {
      const q = await prisma.rfqQuote.findUnique({ where: { id } });
      if (!q) throw new GraphQLError('Quote not found', { extensions: { code: 'NOT_FOUND' } });
      return q;
    },

    orders: async (_, { role, limit = 20, offset = 0 }, { prisma, user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const where = {};
      if (role === 'buyer') where.buyerId = user.id;
      else if (role === 'seller') where.sellerId = user.id;
      else where.OR = [{ buyerId: user.id }, { sellerId: user.id }];
      return prisma.order.findMany({ where, take: limit, skip: offset, orderBy: { createdAt: 'desc' } });
    },

    order: async (_, { id }, { prisma, user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const o = await prisma.order.findUnique({ where: { id } });
      if (!o) throw new GraphQLError('Order not found', { extensions: { code: 'NOT_FOUND' } });
      if (o.buyerId !== user.id && o.sellerId !== user.id && !user.isAdmin)
        throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
      return o;
    },

    mySavedListings: async (_, __, { prisma, user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      return prisma.savedListing.findMany({ where: { userId: user.id }, orderBy: { savedAt: 'desc' } });
    },

    mySavedRfqs: async (_, __, { prisma, user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      return prisma.savedRfq.findMany({ where: { userId: user.id }, orderBy: { savedAt: 'desc' } });
    },
  },

  // ─── MUTATIONS ──────────────────────────────────────────────────────────────

  Mutation: {
    createListing: async (_, { input }, { prisma, user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      if (!['SELLER', 'BOTH'].includes(user.userType))
        throw new GraphQLError('Only sellers can create listings', { extensions: { code: 'FORBIDDEN' } });

      const { categoryId, listingType, title, description, shortDesc, status = 'DRAFT', tags = [], locationId, productDetail, serviceDetail, mediaUrls = [] } = input;

      // Generate slug
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

      const listing = await prisma.$transaction(async (tx) => {
        const newListing = await tx.listing.create({
          data: {
            sellerId: user.id, categoryId, listingType, title, slug, description, shortDesc, status, tags, locationId,
            media: {
              create: mediaUrls.map((url, i) => ({ url, mediaType: 'IMAGE', isPrimary: i === 0, sortOrder: i }))
            }
          }
        });

        if (listingType === 'PRODUCT' && productDetail) {
          await tx.productDetail.create({
            data: {
              listingId: newListing.id,
              brand: productDetail.brand, model: productDetail.model, sku: productDetail.sku,
              unitOfMeasure: productDetail.unitOfMeasure, minOrderQty: productDetail.minOrderQty || 1,
              maxOrderQty: productDetail.maxOrderQty,
              priceType: productDetail.priceType || 'FIXED',
              pricePerUnit: productDetail.pricePerUnit, priceRangeMin: productDetail.priceRangeMin,
              priceRangeMax: productDetail.priceRangeMax, currency: productDetail.currency || 'INR',
              bulkPriceSlabs: productDetail.bulkPriceSlabs, stockAvailable: productDetail.stockAvailable !== false,
              totalStock: productDetail.totalStock, leadTimeDays: productDetail.leadTimeDays,
              hsnCode: productDetail.hsnCode, gstRate: productDetail.gstRate,
              specifications: productDetail.specifications, countryOfOrigin: productDetail.countryOfOrigin,
              supplyAbility: productDetail.supplyAbility, deliveryTime: productDetail.deliveryTime,
              packagingDetails: productDetail.packagingDetails, packagingUnit: productDetail.packagingUnit,
              paymentTerms: productDetail.paymentTerms, fobPort: productDetail.fobPort,
              sampleAvailable: productDetail.sampleAvailable || false, samplePrice: productDetail.samplePrice,
              warranty: productDetail.warranty, returnPolicy: productDetail.returnPolicy,
              certifications: productDetail.certifications || [],
            }
          });
        } else if (listingType === 'SERVICE' && serviceDetail) {
          await tx.serviceDetail.create({
            data: {
              listingId: newListing.id,
              serviceMode: serviceDetail.serviceMode || 'REMOTE',
              providerType: serviceDetail.providerType || 'INDIVIDUAL',
              priceType: serviceDetail.priceType || 'ON_REQUEST',
              basePrice: serviceDetail.basePrice, priceUnit: serviceDetail.priceUnit,
              currency: serviceDetail.currency || 'INR',
              serviceArea: serviceDetail.serviceArea || [], capacitySlots: serviceDetail.capacitySlots || 1,
              typicalDuration: serviceDetail.typicalDuration,
              minEngagementDays: serviceDetail.minEngagementDays, maxEngagementDays: serviceDetail.maxEngagementDays,
              portfolioItems: serviceDetail.portfolioItems || [], certifications: serviceDetail.certifications || [],
              skillsTags: serviceDetail.skillsTags || [], toolsTags: serviceDetail.toolsTags || [],
              languages: serviceDetail.languages || [], avgResponseHrs: serviceDetail.avgResponseHrs,
              teamSize: serviceDetail.teamSize,
            }
          });
        }
        return newListing;
      });
      return listing;
    },

    updateListingStatus: async (_, { id, status }, { prisma, user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const l = await prisma.listing.findUnique({ where: { id } });
      if (!l) throw new GraphQLError('Listing not found', { extensions: { code: 'NOT_FOUND' } });
      if (l.sellerId !== user.id && !user.isAdmin)
        throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
      return prisma.listing.update({ where: { id }, data: { status } });
    },

    deleteListing: async (_, { id }, { prisma, user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const l = await prisma.listing.findUnique({ where: { id } });
      if (!l) throw new GraphQLError('Listing not found', { extensions: { code: 'NOT_FOUND' } });
      if (l.sellerId !== user.id && !user.isAdmin)
        throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
      await prisma.listing.delete({ where: { id } });
      return true;
    },

    createRfqRequest: async (_, { input }, { prisma, user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const { categoryId, rfqType, title, description, quantity, unitOfMeasure, specifications, budgetMin, budgetMax, currency, budgetFlexible, deadline, preferredDeliveryDate, locationPreference, preferredProviderType, preferredServiceMode, visibility, maxQuotes, isAnonymous, attachments = [], tags = [] } = input;
      return prisma.rfqRequest.create({
        data: {
          buyerId: user.id, categoryId, rfqType, title, description, quantity, unitOfMeasure,
          specifications, budgetMin, budgetMax, currency: currency || 'INR', budgetFlexible: budgetFlexible || false,
          deadline: deadline ? new Date(deadline) : null,
          preferredDeliveryDate: preferredDeliveryDate ? new Date(preferredDeliveryDate) : null,
          locationPreference, preferredProviderType, preferredServiceMode,
          visibility: visibility || 'PUBLIC', maxQuotes, isAnonymous: isAnonymous || false,
          attachments, tags,
          expiresAt: deadline ? new Date(deadline) : null,
        }
      });
    },

    closeRfqRequest: async (_, { id }, { prisma, user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const r = await prisma.rfqRequest.findUnique({ where: { id } });
      if (!r) throw new GraphQLError('RFQ not found', { extensions: { code: 'NOT_FOUND' } });
      if (r.buyerId !== user.id && !user.isAdmin) throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
      return prisma.rfqRequest.update({ where: { id }, data: { status: 'CLOSED' } });
    },

    submitRfqQuote: async (_, { input }, { prisma, user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      if (!['SELLER', 'BOTH'].includes(user.userType))
        throw new GraphQLError('Only sellers can submit quotes', { extensions: { code: 'FORBIDDEN' } });
      const { rfqId, listingId, variantId, quotedAmount, currency, gstInclusive, gstRate, totalWithGst, proposalText, coverNote, milestonePlan = [], timelineDays, validUntil, paymentTerms, warrantyTerms, deliveryTerms, attachments = [] } = input;
      const rfq = await prisma.rfqRequest.findUnique({ where: { id: rfqId } });
      if (!rfq) throw new GraphQLError('RFQ not found', { extensions: { code: 'BAD_USER_INPUT' } });
      if (rfq.status !== 'OPEN') throw new GraphQLError('RFQ is no longer open', { extensions: { code: 'BAD_USER_INPUT' } });
      if (rfq.buyerId === user.id) throw new GraphQLError('Cannot quote on your own RFQ', { extensions: { code: 'BAD_USER_INPUT' } });

      return prisma.$transaction(async (tx) => {
        const quote = await tx.rfqQuote.create({
          data: {
            rfqId, sellerId: user.id, listingId, variantId, quotedAmount, currency: currency || 'INR',
            gstInclusive: gstInclusive || false, gstRate, totalWithGst, proposalText, coverNote,
            milestonePlan, timelineDays,
            validUntil: validUntil ? new Date(validUntil) : null,
            paymentTerms, warrantyTerms, deliveryTerms, attachments,
          }
        });
        await tx.rfqRequest.update({ where: { id: rfqId }, data: { quotesCount: { increment: 1 } } });
        return quote;
      });
    },

    updateRfqQuoteStatus: async (_, { id, status }, { prisma, user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const q = await prisma.rfqQuote.findUnique({ where: { id }, include: { rfq: true } });
      if (!q) throw new GraphQLError('Quote not found', { extensions: { code: 'NOT_FOUND' } });
      if (q.rfq.buyerId !== user.id && !user.isAdmin)
        throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
      return prisma.rfqQuote.update({ where: { id }, data: { status } });
    },

    updateProfile: async (_, args, { prisma, user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const data = {};
      for (const [k, v] of Object.entries(args)) { if (v !== undefined) data[k] = v; }
      return prisma.user.update({ where: { id: user.id }, data });
    },

    saveListing: async (_, { listingId }, { prisma, user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const existing = await prisma.savedListing.findUnique({ where: { userId_listingId: { userId: user.id, listingId } } });
      if (existing) return existing;
      return prisma.savedListing.create({ data: { userId: user.id, listingId } });
    },

    unsaveListing: async (_, { listingId }, { prisma, user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      await prisma.savedListing.deleteMany({ where: { userId: user.id, listingId } });
      return true;
    },

    saveRfq: async (_, { rfqId }, { prisma, user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const existing = await prisma.savedRfq.findUnique({ where: { userId_rfqId: { userId: user.id, rfqId } } });
      if (existing) return existing;
      return prisma.savedRfq.create({ data: { userId: user.id, rfqId } });
    },

    unsaveRfq: async (_, { rfqId }, { prisma, user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      await prisma.savedRfq.deleteMany({ where: { userId: user.id, rfqId } });
      return true;
    },
  },

  // ─── RELATIONSHIP RESOLVERS ─────────────────────────────────────────────────

  User: {
    businessProfile: (p, _, { prisma }) => prisma.businessProfile.findUnique({ where: { userId: p.id } }),
    addresses: (p, _, { prisma }) => prisma.address.findMany({ where: { userId: p.id } }),
    listings: (p, _, { prisma }) => prisma.listing.findMany({ where: { sellerId: p.id } }),
    rfqRequests: (p, _, { prisma }) => prisma.rfqRequest.findMany({ where: { buyerId: p.id } }),
    rfqQuotes: (p, _, { prisma }) => prisma.rfqQuote.findMany({ where: { sellerId: p.id } }),
    buyerOrders: (p, _, { prisma }) => prisma.order.findMany({ where: { buyerId: p.id } }),
    sellerOrders: (p, _, { prisma }) => prisma.order.findMany({ where: { sellerId: p.id } }),
    reviewsGiven: (p, _, { prisma }) => prisma.review.findMany({ where: { reviewerId: p.id } }),
    reviewsReceived: (p, _, { prisma }) => prisma.review.findMany({ where: { revieweeId: p.id } }),
    savedListings: (p, _, { prisma }) => prisma.savedListing.findMany({ where: { userId: p.id } }),
    savedRfqs: (p, _, { prisma }) => prisma.savedRfq.findMany({ where: { userId: p.id } }),
  },

  BusinessProfile: {
    certifications: (p, _, { prisma }) => prisma.businessCertification.findMany({ where: { businessProfileId: p.id } }),
  },

  Category: {
    parent: (p, _, { prisma }) => p.parentId ? prisma.category.findUnique({ where: { id: p.parentId } }) : null,
    children: (p, _, { prisma }) => prisma.category.findMany({ where: { parentId: p.id } }),
    listings: (p, _, { prisma }) => prisma.listing.findMany({ where: { categoryId: p.id } }),
    attributes: (p, _, { prisma }) => prisma.categoryAttribute.findMany({ where: { categoryId: p.id }, orderBy: { sortOrder: 'asc' } }),
  },

  Listing: {
    seller: (p, _, { prisma }) => prisma.user.findUnique({ where: { id: p.sellerId } }),
    category: (p, _, { prisma }) => prisma.category.findUnique({ where: { id: p.categoryId } }),
    location: (p, _, { prisma }) => p.locationId ? prisma.address.findUnique({ where: { id: p.locationId } }) : null,
    productDetail: (p, _, { prisma }) => prisma.productDetail.findUnique({ where: { listingId: p.id } }),
    serviceDetail: (p, _, { prisma }) => prisma.serviceDetail.findUnique({ where: { listingId: p.id } }),
    media: (p, _, { prisma }) => prisma.listingMedia.findMany({ where: { listingId: p.id }, orderBy: { sortOrder: 'asc' } }),
    variants: (p, _, { prisma }) => prisma.productVariant.findMany({ where: { listingId: p.id, isActive: true }, orderBy: { sortOrder: 'asc' } }),
    rfqQuotes: (p, _, { prisma }) => prisma.rfqQuote.findMany({ where: { listingId: p.id } }),
  },

  ProductVariant: {
    attributeValues: (p, _, { prisma }) => prisma.productAttributeValue.findMany({ where: { variantId: p.id }, include: { attribute: true } }),
    media: (p, _, { prisma }) => prisma.listingMedia.findMany({ where: { variantId: p.id }, orderBy: { sortOrder: 'asc' } }),
  },

  ProductAttributeValue: {
    attribute: (p, _, { prisma }) => prisma.categoryAttribute.findUnique({ where: { id: p.attributeId } }),
  },

  ServiceDetail: {
    packages: (p, _, { prisma }) => prisma.servicePackage.findMany({ where: { serviceDetailId: p.id }, orderBy: { sortOrder: 'asc' } }),
  },

  RfqRequest: {
    buyer: (p, _, { prisma }) => prisma.user.findUnique({ where: { id: p.buyerId } }),
    category: (p, _, { prisma }) => prisma.category.findUnique({ where: { id: p.categoryId } }),
    location: (p, _, { prisma }) => p.locationId ? prisma.address.findUnique({ where: { id: p.locationId } }) : null,
    quotes: (p, _, { prisma }) => prisma.rfqQuote.findMany({ where: { rfqId: p.id } }),
    invites: (p, _, { prisma }) => prisma.rfqInvite.findMany({ where: { rfqId: p.id } }),
  },

  RfqQuote: {
    rfq: (p, _, { prisma }) => prisma.rfqRequest.findUnique({ where: { id: p.rfqId } }),
    seller: (p, _, { prisma }) => prisma.user.findUnique({ where: { id: p.sellerId } }),
    listing: (p, _, { prisma }) => p.listingId ? prisma.listing.findUnique({ where: { id: p.listingId } }) : null,
    order: (p, _, { prisma }) => prisma.order.findFirst({ where: { rfqQuoteId: p.id } }),
  },

  Order: {
    buyer: (p, _, { prisma }) => prisma.user.findUnique({ where: { id: p.buyerId } }),
    seller: (p, _, { prisma }) => prisma.user.findUnique({ where: { id: p.sellerId } }),
    rfqQuote: (p, _, { prisma }) => p.rfqQuoteId ? prisma.rfqQuote.findUnique({ where: { id: p.rfqQuoteId } }) : null,
    items: (p, _, { prisma }) => prisma.orderItem.findMany({ where: { orderId: p.id } }),
    milestones: (p, _, { prisma }) => prisma.milestone.findMany({ where: { orderId: p.id }, orderBy: { sortOrder: 'asc' } }),
    payments: (p, _, { prisma }) => prisma.payment.findMany({ where: { orderId: p.id }, orderBy: { createdAt: 'desc' } }),
    reviews: (p, _, { prisma }) => prisma.review.findMany({ where: { orderId: p.id } }),
  },

  Review: {
    order: (p, _, { prisma }) => prisma.order.findUnique({ where: { id: p.orderId } }),
    reviewer: (p, _, { prisma }) => prisma.user.findUnique({ where: { id: p.reviewerId } }),
    reviewee: (p, _, { prisma }) => prisma.user.findUnique({ where: { id: p.revieweeId } }),
  },

  SavedListing: {
    listing: (p, _, { prisma }) => prisma.listing.findUnique({ where: { id: p.listingId } }),
  },

  SavedRfq: {
    rfq: (p, _, { prisma }) => prisma.rfqRequest.findUnique({ where: { id: p.rfqId } }),
  },
};

module.exports = resolvers;
