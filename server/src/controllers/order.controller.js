const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');
const { checkoutSchema, parse } = require('../validation/schemas');

const generateOrderNumber = () => {
  const stamp = Date.now().toString(36).toUpperCase();
  const noise = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AUR-${stamp}-${noise}`;
};

const calculateTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = subtotal >= env.shipping.freeThreshold ? 0 : env.shipping.flatRate;
  const tax = Number((subtotal * env.shipping.taxRate).toFixed(2));
  return { subtotal: Number(subtotal.toFixed(2)), shipping, tax, total: Number((subtotal + shipping + tax).toFixed(2)) };
};

/** POST /api/orders — checkout. Requires authentication. */
const create = asyncHandler(async (req, res) => {
  const payload = parse(checkoutSchema, req.body);

  const products = await prisma.product.findMany({
    where: { id: { in: payload.items.map((item) => item.productId) }, active: true },
  });

  if (products.length !== new Set(payload.items.map((i) => i.productId)).size) {
    throw ApiError.badRequest('One or more products are no longer available');
  }

  const lines = payload.items.map((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (product.stock < item.quantity) {
      throw ApiError.badRequest(`Only ${product.stock} unit(s) of "${product.name}" left in stock`);
    }
    return {
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      unitPrice: product.price,
      quantity: item.quantity,
      subtotal: Number((product.price * item.quantity).toFixed(2)),
    };
  });

  const totals = calculateTotals(lines);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: req.user.id,
        status: 'PENDING',
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        paymentMethod: payload.paymentMethod,
        shippingName: payload.shippingName,
        shippingPhone: payload.shippingPhone,
        shippingAddress: payload.shippingAddress,
        shippingCity: payload.shippingCity || null,
        shippingZip: payload.shippingZip || null,
        shippingCountry: payload.shippingCountry,
        note: payload.note || null,
        items: { create: lines },
      },
      include: { items: true },
    });

    // Keep stock in sync with confirmed quantities.
    for (const line of lines) {
      // eslint-disable-next-line no-await-in-loop
      await tx.product.update({
        where: { id: line.productId },
        data: { stock: { decrement: line.quantity } },
      });
    }

    return created;
  });

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: { order },
  });
});

/** GET /api/orders — current user's orders. */
const mine = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  res.json({ success: true, data: { orders } });
});

/** GET /api/orders/:orderNumber */
const detail = asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: {
      orderNumber: req.params.orderNumber,
      ...(req.user.role === 'ADMIN' ? {} : { userId: req.user.id }),
    },
    include: { items: true, user: { select: { id: true, name: true, email: true } } },
  });

  if (!order) throw ApiError.notFound('Order not found');

  res.json({ success: true, data: { order } });
});

/** PATCH /api/orders/:orderNumber/status — admin only. */
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  const allowed = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!allowed.includes(status)) throw ApiError.badRequest('Invalid order status');

  const order = await prisma.order.update({
    where: { orderNumber: req.params.orderNumber },
    data: { status },
    include: { items: true },
  });

  res.json({ success: true, data: { order } });
});

/** GET /api/orders/admin/all — admin order board. */
const all = asyncHandler(async (req, res) => {
  const { status, search, page = '1', limit = '20' } = req.query;
  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));

  const where = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search } },
            { shippingName: { contains: search } },
            { user: { email: { contains: search } } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      orders,
      pagination: { page: pageNumber, limit: pageSize, total, pages: Math.max(1, Math.ceil(total / pageSize)) },
    },
  });
});

module.exports = { create, mine, detail, updateStatus, all };
