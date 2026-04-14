const { prisma } = require('../config/database');
const { sendNotification } = require('./notificationService');
const { logger } = require('../utils/logger');

// Match sellers to an RFQ and notify top matches
const matchProvidersToRfq = async (rfq) => {
  try {
    const where = {
      status: 'ACTIVE',
      listingType: rfq.rfqType,
      categoryId: rfq.categoryId,
      seller: { isActive: true, kycStatus: 'VERIFIED' },
    };

    if (rfq.preferredProviderType) {
      where.serviceDetail = { providerType: rfq.preferredProviderType };
    }

    if (rfq.locationPreference) {
      where.OR = [
        { location: { city: { equals: rfq.locationPreference, mode: 'insensitive' } } },
        { serviceDetail: { serviceArea: { has: rfq.locationPreference } } },
      ];
    }

    const candidates = await prisma.listing.findMany({
      where,
      include: {
        seller: { select: { id: true, trustScore: true } },
        serviceDetail: { select: { capacitySlots: true } },
      },
      take: 50,
    });

    // Score candidates
    const scored = candidates.map((listing) => {
      let score = 0;
      score += (listing.seller.trustScore / 100) * 40;
      score += listing.avgRating * 10;
      if (listing.isFeatured) score += 15;
      if (listing.enquiryCount > 10) score += 5;
      return { listing, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const top10 = scored.slice(0, 10);

    const sellerIds = [...new Set(top10.map(s => s.listing.sellerId))];

    // Notify matched sellers
    await Promise.all(
      sellerIds.map((sellerId) =>
        sendNotification({
          userId: sellerId,
          type: 'RFQ_MATCH',
          title: 'New RFQ matches your profile',
          body: `A buyer needs: "${rfq.title}". Submit your quote now!`,
          data: { rfqId: rfq.id, rfqType: rfq.rfqType },
        })
      )
    );

    logger.info(`RFQ ${rfq.id}: Notified ${sellerIds.length} matched providers`);
  } catch (err) {
    logger.error('matchProvidersToRfq error:', err);
    throw err;
  }
};

module.exports = { matchProvidersToRfq };
