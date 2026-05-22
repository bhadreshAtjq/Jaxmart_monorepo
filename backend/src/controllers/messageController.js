const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

// GET /api/messages/conversations
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all participant entries for the current user
    const participants = await prisma.conversationParticipant.findMany({
      where: { userId },
      select: {
        conversationId: true,
      },
    });

    const conversationIds = participants.map((p) => p.conversationId);

    // Get complete conversation objects
    const conversations = await prisma.conversation.findMany({
      where: {
        id: { in: conversationIds },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                businessProfile: {
                  select: {
                    businessName: true,
                  },
                },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Batch-fetch listing data for conversations that have a listingId
    const listingIds = conversations.map(c => c.listingId).filter(Boolean);
    let listingMap = {};
    if (listingIds.length > 0) {
      const listings = await prisma.listing.findMany({
        where: { id: { in: listingIds } },
        select: {
          id: true, title: true,
          media: { where: { isPrimary: true }, take: 1, select: { url: true } },
          productDetail: { select: { pricePerUnit: true, unitOfMeasure: true, minOrderQty: true } },
        },
      });
      listingMap = Object.fromEntries(listings.map(l => [l.id, l]));
    }

    // Format output to include unread count and rename fields
    const formatted = conversations.map((conv) => {
      // Find other participant
      const otherParticipant = conv.participants.find((p) => p.userId !== userId);
      const latestMessage = conv.messages[0] || null;

      const listing = conv.listingId ? listingMap[conv.listingId] || null : null;

      return {
        id: conv.id,
        rfqId: conv.rfqId,
        orderId: conv.orderId,
        listingId: conv.listingId,
        createdAt: conv.createdAt,
        latestMessage,
        listing: listing ? {
          id: listing.id,
          title: listing.title,
          imageUrl: listing.media?.[0]?.url || null,
          pricePerUnit: listing.productDetail?.pricePerUnit || null,
          unitOfMeasure: listing.productDetail?.unitOfMeasure || null,
          minOrderQty: listing.productDetail?.minOrderQty || null,
        } : null,
        recipient: otherParticipant?.user
          ? {
              id: otherParticipant.user.id,
              fullName: otherParticipant.user.fullName,
              avatarUrl: otherParticipant.user.avatarUrl,
              businessName: otherParticipant.user.businessProfile?.businessName || null,
            }
          : null,
      };
    });

    // Sort by latest message date (or conversation created date if no message)
    formatted.sort((a, b) => {
      const timeA = a.latestMessage ? new Date(a.latestMessage.createdAt).getTime() : new Date(a.createdAt).getTime();
      const timeB = b.latestMessage ? new Date(b.latestMessage.createdAt).getTime() : new Date(b.createdAt).getTime();
      return timeB - timeA;
    });

    res.json(formatted);
  } catch (err) {
    logger.error('getConversations error:', err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

// GET /api/messages/conversations/:id/messages
const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify membership
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId: id, userId },
    });

    if (!participant) {
      return res.status(403).json({ error: 'Not authorized to view this conversation' });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages as read for this conversation (run async in background)
    prisma.message.updateMany({
      where: { conversationId: id, isRead: false, senderId: { not: userId } },
      data: { isRead: true },
    }).catch((e) => logger.error('mark read in fetch error:', e));

    res.json(messages);
  } catch (err) {
    logger.error('getMessages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// POST /api/messages/conversations
const startConversation = async (req, res) => {
  try {
    const { recipientId, rfqId, orderId, listingId, initialMessage } = req.body;
    const senderId = req.user.id;

    if (!recipientId) {
      return res.status(400).json({ error: 'Recipient ID is required' });
    }

    if (recipientId === senderId) {
      return res.status(400).json({ error: 'Cannot start a conversation with yourself' });
    }

    // Check if conversation already exists between these participants
    const existingSenderPart = await prisma.conversationParticipant.findMany({
      where: { userId: senderId },
      select: { conversationId: true },
    });

    const existingConvIds = existingSenderPart.map((p) => p.conversationId);

    const existingMatch = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: { in: existingConvIds },
        userId: recipientId,
        conversation: {
          ...(rfqId && { rfqId }),
          ...(orderId && { orderId }),
          ...(listingId && { listingId }),
        },
      },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    avatarUrl: true,
                    businessProfile: { select: { businessName: true } },
                  },
                },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (existingMatch) {
      const conv = existingMatch.conversation;
      const otherParticipant = conv.participants.find((p) => p.userId !== senderId);

      // If there is an initial message, send it via database
      if (initialMessage && initialMessage.trim()) {
        const msg = await prisma.message.create({
          data: {
            conversationId: conv.id,
            senderId,
            content: initialMessage,
          },
        });
        conv.messages = [msg];
      }

      return res.json({
        id: conv.id,
        rfqId: conv.rfqId,
        orderId: conv.orderId,
        listingId: conv.listingId,
        createdAt: conv.createdAt,
        latestMessage: conv.messages[0] || null,
        recipient: otherParticipant?.user
          ? {
              id: otherParticipant.user.id,
              fullName: otherParticipant.user.fullName,
              avatarUrl: otherParticipant.user.avatarUrl,
              businessName: otherParticipant.user.businessProfile?.businessName || null,
            }
          : null,
      });
    }

    // Start transaction to create conversation and participants
    const newConv = await prisma.$transaction(async (tx) => {
      const conversation = await tx.conversation.create({
        data: {
          rfqId: rfqId || null,
          orderId: orderId || null,
          listingId: listingId || null,
        },
      });

      await tx.conversationParticipant.createMany({
        data: [
          { conversationId: conversation.id, userId: senderId },
          { conversationId: conversation.id, userId: recipientId },
        ],
      });

      if (initialMessage && initialMessage.trim()) {
        await tx.message.create({
          data: {
            conversationId: conversation.id,
            senderId,
            content: initialMessage,
          },
        });
      }

      return conversation;
    });

    // Query full conversation object to return
    const completeConv = await prisma.conversation.findUnique({
      where: { id: newConv.id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                businessProfile: { select: { businessName: true } },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const otherParticipant = completeConv.participants.find((p) => p.userId !== senderId);

    res.json({
      id: completeConv.id,
      rfqId: completeConv.rfqId,
      orderId: completeConv.orderId,
      listingId: completeConv.listingId,
      createdAt: completeConv.createdAt,
      latestMessage: completeConv.messages[0] || null,
      recipient: otherParticipant?.user
        ? {
            id: otherParticipant.user.id,
            fullName: otherParticipant.user.fullName,
            avatarUrl: otherParticipant.user.avatarUrl,
            businessName: otherParticipant.user.businessProfile?.businessName || null,
          }
        : null,
    });
  } catch (err) {
    logger.error('startConversation error:', err);
    res.status(500).json({ error: 'Failed to start conversation' });
  }
};

// GET /api/messages/conversations/:id/listing
const getConversationListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId: id, userId },
    });
    if (!participant) return res.status(403).json({ error: 'Not authorized' });

    const conv = await prisma.conversation.findUnique({
      where: { id },
      select: { listingId: true },
    });

    if (!conv?.listingId) return res.json(null);

    const listing = await prisma.listing.findUnique({
      where: { id: conv.listingId },
      include: {
        media: { where: { isPrimary: true }, take: 1 },
        productDetail: true,
        category: { select: { name: true } },
        seller: {
          select: {
            id: true, fullName: true,
            businessProfile: { select: { businessName: true } },
          },
        },
      },
    });

    res.json(listing);
  } catch (err) {
    logger.error('getConversationListing error:', err);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
};

module.exports = {
  getConversations,
  getMessages,
  startConversation,
  getConversationListing,
};
