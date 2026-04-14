const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

module.exports = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.userId}`);
    socket.join(`user:${socket.userId}`);

    socket.on('join_conversation', (conversationId) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on('send_message', async ({ conversationId, content, attachments }) => {
      try {
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: socket.userId,
            content,
            attachments: attachments || [],
          },
          include: {
            conversation: { include: { participants: true } },
          },
        });

        io.to(`conv:${conversationId}`).emit('new_message', message);

        // Notify offline participants
        message.conversation.participants
          .filter(p => p.userId !== socket.userId)
          .forEach(p => {
            io.to(`user:${p.userId}`).emit('notification', {
              type: 'new_message',
              conversationId,
              preview: content.substring(0, 50),
            });
          });
      } catch (err) {
        logger.error('send_message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('mark_read', async ({ conversationId }) => {
      await prisma.message.updateMany({
        where: { conversationId, isRead: false, senderId: { not: socket.userId } },
        data: { isRead: true },
      });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.userId}`);
    });
  });
};
