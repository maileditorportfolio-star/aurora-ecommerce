const express = require('express');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');
const chatRoutes = require('./chat.routes');
const adminRoutes = require('./admin.routes');
const teamRoutes = require('./team.routes');
const storefrontRoutes = require('./storefront.routes');
const uploadRoutes = require('./upload.routes');
const settingsRoutes = require('./settings.routes');
const metricsRoutes = require('./metrics.routes');

const router = express.Router();

/** GET /api/health — verifies the API is up and the database is reachable. */
router.get(
  '/health',
  asyncHandler(async (_req, res) => {
    let database = 'up';

    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'down';
    }

    res.status(database === 'up' ? 200 : 503).json({
      success: database === 'up',
      data: {
        status: database === 'up' ? 'ok' : 'degraded',
        service: 'aurora-commerce-api',
        database,
        uptime: Math.round(process.uptime()),
      },
    });
  }),
);

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/chat', chatRoutes);
router.use('/settings', settingsRoutes);
router.use('/admin/users', teamRoutes);
router.use('/admin/storefront', storefrontRoutes);
router.use('/admin/uploads', uploadRoutes);
router.use('/admin', adminRoutes);
router.use('/metrics', metricsRoutes);

module.exports = router;
