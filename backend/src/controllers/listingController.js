const { prisma } = require('../config/database');
const { cacheGet, cacheSet, cacheDel, CACHE_TTL } = require('../config/redis');
const { logger } = require('../utils/logger');
const { signListingMedia, cleanS3Url } = require('../utils/s3');

// GET /api/listings/search
const searchListings = async (req, res) => {
  try {
    const {
      q, tag, type, categoryId, city, state, minTrust, isVerified,
      minRating, page = 1, limit = 20, sortBy = 'relevance',
      providerType, serviceMode,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = Math.min(parseInt(limit), 100);

    let searchConditions = [];
    if (q && q.trim()) {
      const cleanQ = q.trim();
      const words = cleanQ.split(/\s+/).filter(w => w.length > 1);

      searchConditions = [
        { title: { contains: cleanQ, mode: 'insensitive' } },
        { description: { contains: cleanQ, mode: 'insensitive' } },
        { category: { name: { contains: cleanQ, mode: 'insensitive' } } },
        { category: { parent: { name: { contains: cleanQ, mode: 'insensitive' } } } },
        { productDetail: { brand: { contains: cleanQ, mode: 'insensitive' } } },
        { seller: { businessProfile: { businessName: { contains: cleanQ, mode: 'insensitive' } } } },
        { seller: { fullName: { contains: cleanQ, mode: 'insensitive' } } },
        { tags: { has: cleanQ.toLowerCase() } },
      ];

      for (const word of words) {
        const lowerWord = word.toLowerCase();
        searchConditions.push(
          { title: { contains: word, mode: 'insensitive' } },
          { category: { name: { contains: word, mode: 'insensitive' } } },
          { category: { parent: { name: { contains: word, mode: 'insensitive' } } } },
          { productDetail: { brand: { contains: word, mode: 'insensitive' } } },
          { tags: { has: lowerWord } }
        );
      }
    }

    const where = {
      status: 'ACTIVE',
      ...(type && { listingType: type.toUpperCase() }),
      ...(categoryId && { 
        category: {
          OR: [
            { id: categoryId },
            { parentId: categoryId },
            { parent: { parentId: categoryId } }
          ]
        }
      }),
      ...(minRating && { avgRating: { gte: parseFloat(minRating) } }),
      ...(searchConditions.length > 0 && { OR: searchConditions }),
      ...(tag && {
        tags: { has: tag.toLowerCase() }
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

    let orderBy = [];
    switch (sortBy) {
      case 'rating': orderBy = [{ avgRating: 'desc' }, { id: 'asc' }]; break;
      case 'newest': orderBy = [{ createdAt: 'desc' }, { id: 'asc' }]; break;
      case 'featured': orderBy = [{ isFeatured: 'desc' }, { id: 'asc' }]; break;
      case 'popular': orderBy = [{ viewCount: 'desc' }, { quoteCount: 'desc' }, { reviewCount: 'desc' }, { avgRating: 'desc' }, { id: 'asc' }]; break;
      default: orderBy = [{ isFeatured: 'desc' }, { avgRating: 'desc' }, { id: 'asc' }];
    }

    let finalTake = take;
    if (sortBy === 'popular') {
      if (skip >= 100) finalTake = 0;
      else if (skip + take > 100) finalTake = 100 - skip;
    }

    const [listings, rawTotal] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: finalTake,
        include: {
          seller: {
            select: {
              id: true, fullName: true, trustScore: true, kycStatus: true,
              businessProfile: { select: { businessName: true } },
            },
          },
          category: {
            select: {
              id: true, name: true, slug: true,
              parent: {
                select: {
                  id: true, name: true,
                  parent: {
                    select: { id: true, name: true }
                  }
                }
              }
            }
          },
          location: { select: { city: true, state: true } },
          media: { where: { isPrimary: true }, take: 1 },
          productDetail: {
            select: { pricePerUnit: true, priceType: true, minOrderQty: true, unitOfMeasure: true },
          },
          serviceDetail: {
            select: { serviceMode: true, providerType: true, skillsTags: true, typicalDuration: true },
          },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    const finalTotal = sortBy === 'popular' ? Math.min(rawTotal, 100) : rawTotal;

    const signedListings = await Promise.all(listings.map(l => signListingMedia(l)));

    res.json({
      listings: signedListings,
      pagination: {
        page: parseInt(page),
        limit: take,
        total: finalTotal,
        pages: Math.ceil(finalTotal / take),
      },
    });
  } catch (err) {
    logger.error('searchListings error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
};

// GET /api/listings/new-products
const getNewProducts = async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
        listingType: 'PRODUCT'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100,
      include: {
        seller: {
          select: {
            id: true, fullName: true, trustScore: true, sellerRating: true,
            totalOrdersFulfilled: true, responseRatePercent: true,
            kycStatus: true, createdAt: true, avatarUrl: true,
          }
        },
        media: { orderBy: { sortOrder: 'asc' } },
        productDetail: true,
        variants: {
          take: 1,
          where: { isActive: true },
        },
      }
    });

    const signedListings = await Promise.all(
      listings.map(listing => signListingMedia(listing))
    );

    res.json({
      success: true,
      data: signedListings
    });
  } catch (error) {
    logger.error(`Get New Products Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to fetch new products' });
  }
};

// GET /api/listings/:id
const getListing = async (req, res) => {
  try {
    const { id } = req.params;

    const cacheKey = `listing:${id}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      const signedListing = await signListingMedia(cached);
      return res.json(signedListing);
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true, fullName: true, trustScore: true, sellerRating: true,
            totalOrdersFulfilled: true, responseRatePercent: true,
            kycStatus: true, createdAt: true, avatarUrl: true,
            businessProfile: {
              include: {
                certifications: true,
              },
            },
            addresses: { where: { isPrimary: true }, take: 1 },
          },
        },
        category: {
          include: { attributes: { orderBy: { sortOrder: 'asc' } } },
        },
        location: true,
        media: { orderBy: { sortOrder: 'asc' } },
        productDetail: true,
        serviceDetail: {
          include: {
            packages: { orderBy: { sortOrder: 'asc' } },
          },
        },
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            attributeValues: { include: { attribute: true } },
            media: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });

    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.status !== 'ACTIVE') return res.status(404).json({ error: 'Listing not available' });

    // Increment view count async
    prisma.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => { });

    await cacheSet(cacheKey, listing, CACHE_TTL.MEDIUM);
    const signedListing = await signListingMedia(listing);
    res.json(signedListing);
  } catch (err) {
    logger.error('getListing error:', err);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
};

// POST /api/listings
const createListing = async (req, res) => {
  try {
    const {
      listingType, title, description, categoryId, tags, status,
      // Product-specific
      brand, sku, unitOfMeasure, minOrderQty, pricePerUnit,
      priceType, priceRangeMin, priceRangeMax, bulkPriceSlabs, stockAvailable, leadTimeDays,
      hsnCode, gstRate, specifications,
      supplyAbility, deliveryTime, packagingDetails, paymentTerms, fobPort,
      sampleAvailable, samplePrice, warranty, returnPolicy, certifications,
      variants, // array of { title, sku, priceOverride, stockQty, attributeValues }
      // Service-specific
      serviceMode, serviceArea, capacitySlots, typicalDuration,
      skillsTags, languages, avgResponseHrs, teamSize, basePrice, priceUnit, currency,
      packages, // array of { name, description, price, deliveryDays, revisionsCount, includesItems, isPopular }
      // Media
      images, // array of { url, isPrimary }
    } = req.body;

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;

    const listing = await prisma.$transaction(async (tx) => {
      const newListing = await tx.listing.create({
        data: {
          sellerId: req.user.id,
          listingType: listingType.toUpperCase(),
          title,
          description,
          slug,
          categoryId,
          tags: tags || [],
          status: status || 'ACTIVE',
          ...(listingType.toUpperCase() === 'PRODUCT' && {
            productDetail: {
              create: {
                brand, sku, unitOfMeasure: unitOfMeasure || 'pcs',
                minOrderQty: minOrderQty || 1,
                pricePerUnit, priceType: priceType || 'FIXED',
                priceRangeMin, priceRangeMax,
                bulkPriceSlabs: bulkPriceSlabs || [],
                stockAvailable: stockAvailable !== false,
                leadTimeDays, hsnCode, gstRate, specifications: specifications || {},
                supplyAbility, deliveryTime, packagingDetails, paymentTerms, fobPort,
                sampleAvailable: sampleAvailable || false, samplePrice, warranty, returnPolicy,
                certifications: certifications || [],
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
                avgResponseHrs, teamSize, basePrice, priceUnit, currency: currency || 'INR',
              },
            },
          }),
          ...(images && images.length > 0 && {
            media: {
              create: images.map((img, i) => ({
                url: cleanS3Url(img.url),
                mediaType: 'IMAGE',
                isPrimary: img.isPrimary || i === 0,
              })),
            },
          }),
        },
        include: { productDetail: true, serviceDetail: true },
      });

      // Handle product variants
      if (listingType.toUpperCase() === 'PRODUCT' && variants && variants.length > 0) {
        for (const v of variants) {
          const createdVariant = await tx.productVariant.create({
            data: {
              listingId: newListing.id,
              productDetailId: newListing.productDetail.id,
              sellerId: req.user.id,
              sku: v.sku,
              title: v.title,
              priceOverride: v.priceOverride,
              stockQty: v.stockQty || 0,
            }
          });

          if (v.attributeValues && v.attributeValues.length > 0) {
            for (const av of v.attributeValues) {
              await tx.productAttributeValue.create({
                data: {
                  variantId: createdVariant.id,
                  attributeId: av.attributeId,
                  value: av.value,
                  unit: av.unit
                }
              });
            }
          }
        }
      }

      // Handle service packages
      if (listingType.toUpperCase() === 'SERVICE' && packages && packages.length > 0) {
        for (const pkg of packages) {
          await tx.servicePackage.create({
            data: {
              serviceDetailId: newListing.serviceDetail.id,
              name: pkg.name,
              description: pkg.description,
              price: pkg.price,
              deliveryDays: pkg.deliveryDays,
              revisionsCount: pkg.revisionsCount || 1,
              includesItems: pkg.includesItems || [],
              isPopular: pkg.isPopular || false,
            }
          });
        }
      }

      return newListing;
    }, {
      maxWait: 15000,
      timeout: 30000
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

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { productDetail: true, serviceDetail: true }
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.sellerId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const {
      title, description, tags, status,
      productDetail,
      variants,
      serviceDetail,
      packages,
      images
    } = req.body;

    await prisma.$transaction(async (tx) => {
      // 1. Update main listing fields
      await tx.listing.update({
        where: { id },
        data: {
          title,
          description,
          tags: tags || [],
          status: status || 'ACTIVE'
        }
      });

      // 2. Handle product details and variants
      if (listing.listingType === 'PRODUCT' && productDetail) {
        await tx.productDetail.update({
          where: { listingId: id },
          data: {
            brand: productDetail.brand,
            sku: productDetail.sku,
            unitOfMeasure: productDetail.unitOfMeasure,
            minOrderQty: productDetail.minOrderQty,
            maxOrderQty: productDetail.maxOrderQty,
            priceType: productDetail.priceType,
            pricePerUnit: productDetail.pricePerUnit,
            priceRangeMin: productDetail.priceRangeMin,
            priceRangeMax: productDetail.priceRangeMax,
            bulkPriceSlabs: productDetail.bulkPriceSlabs,
            stockAvailable: productDetail.stockAvailable,
            leadTimeDays: productDetail.leadTimeDays,
            hsnCode: productDetail.hsnCode,
            gstRate: productDetail.gstRate,
            specifications: productDetail.specifications,
            countryOfOrigin: productDetail.countryOfOrigin,
            supplyAbility: productDetail.supplyAbility,
            deliveryTime: productDetail.deliveryTime,
            packagingDetails: productDetail.packagingDetails,
            packagingUnit: productDetail.packagingUnit,
            paymentTerms: productDetail.paymentTerms,
            fobPort: productDetail.fobPort,
            sampleAvailable: productDetail.sampleAvailable,
            samplePrice: productDetail.samplePrice,
            warranty: productDetail.warranty,
            returnPolicy: productDetail.returnPolicy,
            certifications: productDetail.certifications,
          }
        });

        if (variants) {
          const incomingVariantIds = variants.map(v => v.id).filter(Boolean);
          await tx.productVariant.deleteMany({
            where: {
              listingId: id,
              id: { notIn: incomingVariantIds }
            }
          });

          for (const v of variants) {
            if (v.id) {
              await tx.productVariant.update({
                where: { id: v.id },
                data: {
                  title: v.title,
                  sku: v.sku,
                  priceOverride: v.priceOverride,
                  stockQty: v.stockQty,
                  isActive: v.isActive !== false
                }
              });

              if (v.attributeValues) {
                const incomingAttrIds = v.attributeValues.map(av => av.attributeId).filter(Boolean);
                await tx.productAttributeValue.deleteMany({
                  where: {
                    variantId: v.id,
                    attributeId: { notIn: incomingAttrIds }
                  }
                });

                for (const av of v.attributeValues) {
                  await tx.productAttributeValue.upsert({
                    where: {
                      variantId_attributeId: {
                        variantId: v.id,
                        attributeId: av.attributeId
                      }
                    },
                    update: {
                      value: av.value,
                      unit: av.unit
                    },
                    create: {
                      variantId: v.id,
                      attributeId: av.attributeId,
                      value: av.value,
                      unit: av.unit
                    }
                  });
                }
              }
            } else {
              const createdVariant = await tx.productVariant.create({
                data: {
                  listingId: id,
                  productDetailId: listing.productDetail.id,
                  sellerId: req.user.id,
                  sku: v.sku,
                  title: v.title,
                  priceOverride: v.priceOverride,
                  stockQty: v.stockQty || 0,
                  isActive: v.isActive !== false
                }
              });

              if (v.attributeValues) {
                for (const av of v.attributeValues) {
                  await tx.productAttributeValue.create({
                    data: {
                      variantId: createdVariant.id,
                      attributeId: av.attributeId,
                      value: av.value,
                      unit: av.unit
                    }
                  });
                }
              }
            }
          }
        }
      }

      // 3. Handle service details and packages
      if (listing.listingType === 'SERVICE' && serviceDetail) {
        await tx.serviceDetail.update({
          where: { listingId: id },
          data: {
            serviceMode: serviceDetail.serviceMode,
            providerType: serviceDetail.providerType,
            priceType: serviceDetail.priceType,
            basePrice: serviceDetail.basePrice,
            priceUnit: serviceDetail.priceUnit,
            currency: serviceDetail.currency,
            serviceArea: serviceDetail.serviceArea,
            capacitySlots: serviceDetail.capacitySlots,
            typicalDuration: serviceDetail.typicalDuration,
            minEngagementDays: serviceDetail.minEngagementDays,
            maxEngagementDays: serviceDetail.maxEngagementDays,
            skillsTags: serviceDetail.skillsTags,
            toolsTags: serviceDetail.toolsTags,
            languages: serviceDetail.languages,
            avgResponseHrs: serviceDetail.avgResponseHrs,
            teamSize: serviceDetail.teamSize,
          }
        });

        if (packages) {
          const incomingPackageIds = packages.map(p => p.id).filter(Boolean);
          await tx.servicePackage.deleteMany({
            where: {
              serviceDetailId: listing.serviceDetail.id,
              id: { notIn: incomingPackageIds }
            }
          });

          for (const pkg of packages) {
            if (pkg.id) {
              await tx.servicePackage.update({
                where: { id: pkg.id },
                data: {
                  name: pkg.name,
                  description: pkg.description,
                  price: pkg.price,
                  deliveryDays: pkg.deliveryDays,
                  revisionsCount: pkg.revisionsCount,
                  includesItems: pkg.includesItems || [],
                  isPopular: pkg.isPopular || false,
                }
              });
            } else {
              await tx.servicePackage.create({
                data: {
                  serviceDetailId: listing.serviceDetail.id,
                  name: pkg.name,
                  description: pkg.description,
                  price: pkg.price,
                  deliveryDays: pkg.deliveryDays,
                  revisionsCount: pkg.revisionsCount || 1,
                  includesItems: pkg.includesItems || [],
                  isPopular: pkg.isPopular || false,
                }
              });
            }
          }
        }
      }

      // 4. Handle images update
      if (images) {
        await tx.listingMedia.deleteMany({ where: { listingId: id } });
        if (images.length > 0) {
          await tx.listingMedia.createMany({
            data: images.map((img, i) => ({
              listingId: id,
              url: cleanS3Url(img.url),
              mediaType: 'IMAGE',
              isPrimary: img.isPrimary || i === 0,
            }))
          });
        }
      }
    }, {
      maxWait: 15000,
      timeout: 30000
    });

    await cacheDel(`listing:${id}`);
    res.json({ message: 'Listing updated successfully' });
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
          productDetail: { select: { pricePerUnit: true, priceType: true } },
          serviceDetail: { select: { serviceMode: true, skillsTags: true } },
          category: { select: { name: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    const signedListings = await Promise.all(listings.map(l => signListingMedia(l)));
    res.json({ listings: signedListings, total, page: parseInt(page) });
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
                  supplyAbility: l.supplyAbility,
                  deliveryTime: l.deliveryTime,
                  packagingDetails: l.packagingDetails,
                  paymentTerms: l.paymentTerms,
                  fobPort: l.fobPort,
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

// GET /api/listings/suggestions?q=...
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      const defaultCategories = await prisma.category.findMany({
        take: 5,
        orderBy: { listings: { _count: 'desc' } },
        select: { id: true, name: true, slug: true }
      });
      return res.json({
        categories: defaultCategories,
        listings: [],
        brands: [],
        recent: ['Cotton Shirts', 'Industrial Lubricants', 'Textiles', 'Gear Oil', 'Safety Equipment']
      });
    }

    const cleanQ = q.trim();
    const cacheKey = `suggestions:${cleanQ.toLowerCase()}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const words = cleanQ.split(/\s+/).filter(w => w.length > 1);

    const [categories, listings, brandsData] = await Promise.all([
      prisma.category.findMany({
        where: {
          OR: [
            { name: { contains: cleanQ, mode: 'insensitive' } },
            { metaDescription: { contains: cleanQ, mode: 'insensitive' } },
            { slug: { contains: cleanQ, mode: 'insensitive' } },
          ]
        },
        take: 4,
        select: { id: true, name: true, slug: true, parent: { select: { name: true } } }
      }),

      prisma.listing.findMany({
        where: {
          status: 'ACTIVE',
          seller: { isActive: true },
          OR: [
            { title: { contains: cleanQ, mode: 'insensitive' } },
            { tags: { has: cleanQ.toLowerCase() } },
            { category: { name: { contains: cleanQ, mode: 'insensitive' } } },
            ...words.map(w => ({ title: { contains: w, mode: 'insensitive' } })),
          ]
        },
        take: 6,
        select: {
          id: true,
          title: true,
          listingType: true,
          media: { select: { url: true, isPrimary: true } },
          category: { select: { name: true } },
          productDetail: {
            select: {
              pricePerUnit: true,
              unitOfMeasure: true,
              minOrderQty: true,
              brand: true
            }
          },
          seller: {
            select: {
              businessProfile: { select: { businessName: true } }
            }
          }
        }
      }),

      prisma.productDetail.findMany({
        where: {
          brand: { contains: cleanQ, mode: 'insensitive' }
        },
        take: 3,
        distinct: ['brand'],
        select: { brand: true }
      })
    ]);

    const result = {
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        parentName: c.parent?.name || null
      })),
      listings: listings.map(l => {
        const primaryMedia = l.media?.find(m => m.isPrimary) || l.media?.[0];
        return {
          id: l.id,
          title: l.title,
          listingType: l.listingType,
          image: primaryMedia?.url || null,
          categoryName: l.category?.name || 'General',
          pricePerUnit: l.productDetail?.pricePerUnit || null,
          unitOfMeasure: l.productDetail?.unitOfMeasure || 'Unit',
          brand: l.productDetail?.brand || null,
          sellerName: l.seller?.businessProfile?.businessName || null
        };
      }),
      brands: brandsData.map(b => b.brand).filter(Boolean),
    };

    await cacheSet(cacheKey, result, 60);
    return res.json(result);
  } catch (err) {
    logger.error('Error fetching search suggestions:', err);
    return res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
};

module.exports = {
  searchListings,
  getSearchSuggestions,
  getNewProducts,
  getListing,
  createListing,
  updateListing,
  getMyListings,
  publishListing,
  bulkCreateListings,
};
