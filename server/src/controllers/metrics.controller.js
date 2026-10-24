const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

/** GET /api/metrics — lightweight observability snapshot (process + catalogue). */
const metrics = asyncHandler(async (_req, res) => {
  const memory = process.memoryUsage();

  const [users, products, orders, categories] = await Promise.all([
    prisma.user.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.category.count(),
  ]);

  res.json({
    success: true,
    data: {
      uptime: Math.round(process.uptime()),
      pid: process.pid,
      nodeVersion: process.version,
      memory: {
        rss: Math.round(memory.rss / 1024 / 1024),
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
      },
      catalogue: { users, products, orders, categories },
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = { metrics };
