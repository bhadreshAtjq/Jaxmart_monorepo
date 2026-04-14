const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ notifications });
  } catch (err) {
    logger.error('getNotifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// PATCH /api/notifications/:id/read
const markRead = async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id, userId: req.user.id },
      data: { isRead: true },
    });
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    logger.error('markRead error:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// POST /api/notifications/mark-all-read
const markAllRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    logger.error('markAllRead error:', err);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
};

module.exports = {
  getNotifications,
  markRead,
  markAllRead,
};
