const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** GET /api/admin/stats — dashboard metrics for the admin console. */
const stats = asyncHandler(async (_req, res) => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [orders, productCount, customerCount, categoryCount, products] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { id: true, total: true, status: true, createdAt: true, items: true },
    }),
    prisma.product.count({ where: { active: true } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.category.count(),
    prisma.product.findMany({
      select: { id: true, name: true, stock: true, price: true },
    }),
  ]);

  const delivered = orders.filter((order) => order.status === 'DELIVERED');
  const revenue = delivered.reduce((sum, order) => sum + order.total, 0);
  const pipeline = orders
    .filter((order) => !['CANCELLED', 'DELIVERED'].includes(order.status))
    .reduce((sum, order) => sum + order.total, 0);

  const revenueByMonth = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const total = delivered
      .filter((order) => {
        const created = new Date(order.createdAt);
        return (
          created.getFullYear() === date.getFullYear() && created.getMonth() === date.getMonth()
        );
      })
      .reduce((sum, order) => sum + order.total, 0);

    return {
      month: MONTH_LABELS[date.getMonth()],
      revenue: Math.round(total),
      orders: delivered.filter((order) => {
        const created = new Date(order.createdAt);
        return (
          created.getFullYear() === date.getFullYear() && created.getMonth() === date.getMonth()
        );
      }).length,
    };
  });

  const statusCounts = [
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ].map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length,
  }));

  const soldByProduct = new Map();
  orders.forEach((order) => {
    order.items.forEach((item) => {
      soldByProduct.set(item.name, (soldByProduct.get(item.name) || 0) + item.quantity);
    });
  });

  const topProducts = products
    .map((product) => ({ name: product.name, units: soldByProduct.get(product.name) || 0 }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  const lowStock = products
    .filter((product) => product.stock > 0 && product.stock <= 5)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  res.json({
    success: true,
    data: {
      totals: {
        revenue: Math.round(revenue),
        pipeline: Math.round(pipeline),
        orders: orders.length,
        products: productCount,
        customers: customerCount,
        categories: categoryCount,
        averageOrder: orders.length ? Math.round(revenue / delivered.length || 0) : 0,
      },
      revenueByMonth,
      statusCounts,
      topProducts,
      lowStock,
    },
  });
});

/** GET /api/admin/customers — customer list with lifetime order value. */
const customers = asyncHandler(async (req, res) => {
  const { search = '', page = '1', limit = '20' } = req.query;
  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));

  const where = {
    role: 'CUSTOMER',
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {}),
  };

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const withTotals = await Promise.all(
    customers.map(async (customer) => {
      const orders = await prisma.order.findMany({
        where: { userId: customer.id, status: { not: 'CANCELLED' } },
        select: { total: true },
      });
      return {
        ...customer,
        orderCount: customer._count.orders,
        lifetimeValue: orders.reduce((sum, order) => sum + order.total, 0),
      };
    }),
  );

  res.json({
    success: true,
    data: {
      customers: withTotals,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        pages: Math.max(1, Math.ceil(total / pageSize)),
      },
    },
  });
});

module.exports = { stats, customers };
