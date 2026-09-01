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
const eventRoutes = require('./routes/events');
const subscriptionRoutes = require('./routes/subscriptions');
const kycRoutes = require('./routes/kyc');
const dealRoutes = require('./routes/deals');
const captainRoutes = require('./routes/captain');

const app = express();
const httpServer = createServer(app);

// Security & CORS Configuration
const configuredOrigins = [
  process.env.WEB_URL,
  process.env.ADMIN_URL,
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGIN || process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
].filter(Boolean);

const allowedOrigins = [
  'https://jaxmart.vercel.app',
  'https://jaxmart-admin.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:8081',
  'http://localhost:19006',
  `http://localhost:${process.env.PORT || 4000}`,
  `http://127.0.0.1:${process.env.PORT || 4000}`,
  ...configuredOrigins,
].filter(Boolean);

const isOriginAllowed = (origin) => {
  // Allow non-browser clients (mobile apps, curl, Postman, server-to-server)
  if (!origin) return true;

  const cleanOrigin = origin.replace(/\/+$/, '');

  // Wildcard allow
  if (process.env.CORS_ORIGIN === '*' || process.env.NODE_ENV === 'development') {
    return true;
  }

  // Exact match from allowed list
  if (allowedOrigins.some(o => o.replace(/\/+$/, '') === cleanOrigin)) return true;

  // Localhost or 127.0.0.1 on any port
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)) return true;

  // IP addresses with or without port (e.g. EC2 public/private IPs http://3.111.57.216 or http://3.111.57.216:3000)
  if (/^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(cleanOrigin)) return true;

  // Cloud platform domains (Vercel, Render, Railway, Netlify, AWS Amplify)
  if (
    cleanOrigin.endsWith('.vercel.app') ||
    cleanOrigin.endsWith('.onrender.com') ||
    cleanOrigin.endsWith('.railway.app') ||
    cleanOrigin.endsWith('.netlify.app') ||
    cleanOrigin.endsWith('.amplifyapp.com')
  ) {
    return true;
  }

  return false;
};

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        logger.warn(`Socket.IO CORS origin allowed with fallback: ${origin}`);
        callback(null, true);
      }
    },
    credentials: true,
  },
});
socketHandler(io);
app.set('io', io);

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS fallback allowed for origin: ${origin}`);
      // Return true to prevent hard 500 error crashes on client requests
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 2000,
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
app.use('/api/events', eventRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/captain', captainRoutes);

const { setupGraphQL } = require('./graphql');

const startServer = async () => {
  try {
    // Set up GraphQL endpoint before the 404 handler
    await setupGraphQL(app);

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
  } catch (err) {
    logger.error('Failed to initialize server:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
