const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

const sendNotification = async ({ userId, type, title, body, data }) => {
  try {
    const notification = await prisma.notification.create({
      data: { userId, type, title, body, data: data || {} },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (user?.fcmToken) {
      // In production, send via Firebase Admin SDK
      logger.info(`Push notification to ${userId}: ${title}`);
    }

    return notification;
  } catch (err) {
    logger.error('sendNotification error:', err);
  }
};

module.exports = { sendNotification };
