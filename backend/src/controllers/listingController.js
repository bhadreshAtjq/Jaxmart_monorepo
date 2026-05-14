const { prisma } = require('../config/database');
const { cacheGet, cacheSet, cacheDel, CACHE_TTL } = require('../config/redis');
const { logger } = require('../utils/logger');

// GET /api/listings/search
const searchListings = async (req, res) => {
  try {
    const {
      q, type, categoryId, city, state, minTrust, isVerified,
      minRating, page = 1, limit = 20, sortBy = 'relevance',
      providerType, serviceMode,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = Math.min(parseInt(limit), 50);

    const where = {
      status: 'ACTIVE',
      ...(type && { listingType: type.toUpperCase() }),
      ...(categoryId && { categoryId }),
      ...(minRating && { avgRating: { gte: parseFloat(minRating) } }),
      ...(q && {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { tags: { has: q.toLowerCase() } },
        ],
      }),
      seller: {
        isActive: true,
        ...(isVerified === 'true' && { kycStatus: 'VERIFIED' }),
        ...(minTrust && { trustScore: { gte: parseInt(minTrust) } }),
      },
      ...(city && {
        location: { city: { equals: city, mode: 'insensitive' } },
      }),
    };

    let orderBy = {};
    switch (sortBy) {
      case 'rating': orderBy = { avgRating: 'desc' }; break;
      case 'newest': orderBy = { createdAt: 'desc' }; break;
      case 'featured': orderBy = { isFeatured: 'desc' }; break;
      default: orderBy = [{ isFeatured: 'desc' }, { avgRating: 'desc' }];
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          seller: {
            select: {
              id: true, fullName: true, trustScore: true, kycStatus: true,
              businessProfile: { select: { businessName: true } },
            },
          },
          category: { select: { id: true, name: true, slug: true } },
          location: { select: { city: true, state: true } },
          media: { where: { isPrimary: true }, take: 1 },
          productDetail: {
            select: { pricePerUnit: true, priceOnRequest: true, minOrderQty: true, unitOfMeasure: true },
          },
          serviceDetail: {
            select: { serviceMode: true, providerType: true, skillsTags: true, typicalDuration: true },
          },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({
      listings,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    logger.error('searchListings error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
};

// GET /api/listings/:id
const getListing = async (req, res) => {
  try {
    const { id } = req.params;

    const cacheKey = `listing:${id}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true, fullName: true, trustScore: true, kycStatus: true,
            createdAt: true, avatarUrl: true,
            businessProfile: true,
            addresses: { where: { isPrimary: true }, take: 1 },
          },
        },
        category: true,
        location: true,
        media: { orderBy: { sortOrder: 'asc' } },
        productDetail: true,
        serviceDetail: true,
      },
    });

    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.status !== 'ACTIVE') return res.status(404).json({ error: 'Listing not available' });

    // Increment view count async
    prisma.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});

    await cacheSet(cacheKey, listing, CACHE_TTL.MEDIUM);
    res.json(listing);
  } catch (err) {
    logger.error('getListing error:', err);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
};

// POST /api/listings
const createListing = async (req, res) => {
  try {
    const {
      listingType, title, description, categoryId, tags,
      // Product-specific
      brand, sku, unitOfMeasure, minOrderQty, pricePerUnit,
      priceOnRequest, bulkPriceSlabs, stockAvailable, leadTimeDays,
      hsnCode, gstRate, specifications,
      // Service-specific
      serviceMode, serviceArea, capacitySlots, typicalDuration,
      skillsTags, languages, certifications,
      // Media
      images, // array of { url, isPrimary }
    } = req.body;

    const listing = await prisma.listing.create({
      data: {
        sellerId: req.user.id,
        listingType: listingType.toUpperCase(),
        title,
        description,
        categoryId,
        tags: tags || [],
        status: 'DRAFT',
        ...(listingType.toUpperCase() === 'PRODUCT' && {
          productDetail: {
            create: {
              brand, sku, unitOfMeasure: unitOfMeasure || 'pcs',
              minOrderQty: minOrderQty || 1,
              pricePerUnit, priceOnRequest: priceOnRequest || false,
              bulkPriceSlabs, stockAvailable: stockAvailable !== false,
              leadTimeDays, hsnCode, gstRate, specifications,
            },
          },
        }),
        ...(listingType.toUpperCase() === 'SERVICE' && {
          serviceDetail: {
            create: {
              serviceMode: serviceMode || 'REMOTE',
              serviceArea: serviceArea || [],
              capacitySlots: capacitySlots || 1,
              typicalDuration, skillsTags: skillsTags || [],
              languages: languages || ['English'],
              certifications: certifications || [],
            },
          },
        }),
        ...(images && images.length > 0 && {
          media: {
            create: images.map((img, i) => ({
              url: img.url,
              mediaType: 'IMAGE',
              isPrimary: img.isPrimary || i === 0,
            })),
          },
        }),
      },
      include: { productDetail: true, serviceDetail: true },
    });

    res.status(201).json(listing);
  } catch (err) {
    logger.error('createListing error:', err);
    res.status(500).json({ error: 'Failed to create listing' });
  }
};

// PUT /api/listings/:id
const updateListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.sellerId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const { title, description, tags, status, ...rest } = req.body;

    await prisma.listing.update({
      where: { id },
      data: { title, description, tags, status },
    });

    await cacheDel(`listing:${id}`);
    res.json({ message: 'Listing updated' });
  } catch (err) {
    logger.error('updateListing error:', err);
    res.status(500).json({ error: 'Failed to update listing' });
  }
};

// GET /api/listings/seller/me
const getMyListings = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      sellerId: req.user.id,
      ...(status && { status: status.toUpperCase() }),
      ...(type && { listingType: type.toUpperCase() }),
    };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          media: { where: { isPrimary: true }, take: 1 },
          productDetail: { select: { pricePerUnit: true, priceOnRequest: true } },
          serviceDetail: { select: { serviceMode: true, skillsTags: true } },
          category: { select: { name: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({ listings, total, page: parseInt(page) });
  } catch (err) {
    logger.error('getMyListings error:', err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
};

// PATCH /api/listings/:id/publish
const publishListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { productDetail: true, serviceDetail: true, media: true },
    });

    if (!listing) return res.status(404).json({ error: 'Not found' });
    if (listing.sellerId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    if (listing.media.length === 0) {
      return res.status(400).json({ error: 'Add at least one image before publishing' });
    }

    await prisma.listing.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });

    await cacheDel(`listing:${id}`);
    res.json({ message: 'Listing published successfully' });
  } catch (err) {
    logger.error('publishListing error:', err);
    res.status(500).json({ error: 'Failed to publish' });
  }
};

const bulkCreateListings = async (req, res) => {
  try {
    const { listings } = req.body;
    if (!Array.isArray(listings)) return res.status(400).json({ error: 'Listings array required' });

    const results = await prisma.$transaction(
      listings.map((l) =>
        prisma.listing.create({
          data: {
            sellerId: req.user.id,
            listingType: l.listingType.toUpperCase(),
            title: l.title,
            description: l.description,
            categoryId: l.categoryId,
            tags: l.tags || [],
            status: 'ACTIVE', // Auto-publish for bulk upload
            ...(l.listingType.toUpperCase() === 'PRODUCT' && {
              productDetail: {
                create: {
                  brand: l.brand,
                  sku: l.sku,
                  unitOfMeasure: l.unitOfMeasure || 'pcs',
                  minOrderQty: l.minOrderQty || 1,
                  pricePerUnit: l.pricePerUnit,
                  stockAvailable: l.stockAvailable !== false,
                  leadTimeDays: l.leadTimeDays,
                },
              },
            }),
            ...(l.listingType.toUpperCase() === 'SERVICE' && {
              serviceDetail: {
                create: {
                  serviceMode: l.serviceMode || 'REMOTE',
                  providerType: l.providerType || 'BUSINESS',
                  typicalDuration: l.typicalDuration,
                },
              },
            }),
            media: {
              create: (l.images || []).map((url, i) => ({
                url: url,
                mediaType: 'IMAGE',
                isPrimary: i === 0,
              })),
            },
          },
        })
      ),
      { timeout: 30000 }
    );

    res.status(201).json({ count: results.length });
  } catch (err) {
    logger.error('bulkCreateListings error:', err);
    res.status(500).json({ error: 'Failed to bulk create listings' });
  }
};

module.exports = { 
  searchListings, getListing, createListing, 
  updateListing, getMyListings, publishListing, 
  bulkCreateListings 
};
