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
      seller: { isActive: true },
    };

    // Removed location and provider type filters to match ALL sellers with the same product

    const candidates = await prisma.listing.findMany({
      where,
      include: {
        seller: { select: { id: true, trustScore: true } },
        serviceDetail: { select: { capacitySlots: true } },
      }
    });

    // Extract unique seller IDs from all matching candidates
    const sellerIds = [...new Set(candidates.map(c => c.sellerId))];

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
