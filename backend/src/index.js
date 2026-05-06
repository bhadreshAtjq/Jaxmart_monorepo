require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createServer } = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');

const { logger } = require('./utils/logger');
const { prisma } = require('./config/database');
const { redis } = require('./config/redis');
const socketHandler = require('./services/socketService');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const listingRoutes = require('./routes/listings');
const rfqRoutes = require('./routes/rfq');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');
const disputeRoutes = require('./routes/disputes');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');
const categoryRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');

const app = express();
const httpServer = createServer(app);

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: [process.env.WEB_URL, process.env.ADMIN_URL],
    credentials: true,
  },
});
socketHandler(io);
app.set('io', io);

// Security
app.use(helmet());
app.use(cors({
  origin: [process.env.WEB_URL, process.env.ADMIN_URL, 'http://localhost:3000'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic process health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'Jaxmart API is running',
    documentation: '/api-docs (if available)',
    health: '/health'
  });
});

app.get('/ping', (req, res) => {
  res.json({ status: 'alive', message: 'Server is running' });
});

app.get('/api', (req, res) => {
  res.json({ status: 'api_active', version: '1.0.0' });
});

// Deep health check (DB + Redis)
app.get('/health', async (req, res) => {
  try {
    // Primary signal check
    await prisma.$queryRaw`SELECT 1`;
    
    // Cache signal (Optional)
    let redisStatus = 'degraded';
    try {
      const ping = await redis.ping();
      if (ping === 'PONG') redisStatus = 'ok';
    } catch {
      // Redis offline - platform remains functional
    }

    res.json({ 
      status: 'ok', 
      services: {
        database: 'ok',
        cache: redisStatus
      },
      timestamp: new Date().toISOString() 
    });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'down', message: err.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/rfq', rfqRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;
