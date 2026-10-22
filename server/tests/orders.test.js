import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { setupApp, customer, admin, order, tokenFor } from './helpers/app.js';

const { app, prisma, reset } = setupApp();

const catalogue = {
  id: 'product-1',
  name: 'Aurora Pro 14 Ultrabook',
  slug: 'aurora-pro-14-ultrabook',
  price: 118000,
  imageUrl: 'https://picsum.photos/seed/aurora-laptop/900/700',
  stock: 18,
  categoryId: 'category-1',
  active: true,
};

const checkoutBody = {
  items: [{ productId: catalogue.id, quantity: 2 }],
  shippingName: 'Demo Customer',
  shippingPhone: '+8801800000000',
  shippingAddress: 'House 1, Road 2, Dhaka 1207',
  shippingCity: 'Dhaka',
  shippingZip: '1207',
  shippingCountry: 'Bangladesh',
  paymentMethod: 'cod',
};

const signedIn = () => {
  prisma.user.findUnique.mockResolvedValue(customer);
  return tokenFor(customer);
};

describe('POST /api/orders', () => {
  beforeEach(() => reset());

  it('creates an order and returns it with the calculated totals', async () => {
    const token = signedIn();
    prisma.product.findMany.mockResolvedValue([catalogue]);
    prisma.order.create.mockResolvedValue(order);

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', token)
      .send(checkoutBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order).toEqual(order);

    const { data } = prisma.order.create.mock.calls[0][0];
    expect(data.subtotal).toBe(236000);
    expect(data.shipping).toBe(0);
    expect(data.tax).toBe(0);
    expect(data.total).toBe(236000);
    expect(data.status).toBe('PENDING');
    expect(data.items.create).toHaveLength(1);
  });

  it('generates an order number for the new order', async () => {
    const token = signedIn();
    prisma.product.findMany.mockResolvedValue([catalogue]);
    prisma.order.create.mockResolvedValue(order);

    await request(app).post('/api/orders').set('Authorization', token).send(checkoutBody);

    const { data } = prisma.order.create.mock.calls[0][0];
    expect(data.orderNumber).toMatch(/^AUR-[A-Z0-9]+-[A-Z0-9]+$/);
  });

  it('decrements the stock of every ordered product', async () => {
    const token = signedIn();
    prisma.product.findMany.mockResolvedValue([catalogue]);
    prisma.order.create.mockResolvedValue(order);

    await request(app).post('/api/orders').set('Authorization', token).send(checkoutBody);

    expect(prisma.product.update).toHaveBeenCalledTimes(1);
    expect(prisma.product.update.mock.calls[0][0]).toEqual({
      where: { id: catalogue.id },
      data: { stock: { decrement: 2 } },
    });
  });

  it('charges the flat shipping rate below the free-shipping threshold', async () => {
    const token = signedIn();
    prisma.product.findMany.mockResolvedValue([{ ...catalogue, price: 100, stock: 50 }]);
    prisma.order.create.mockResolvedValue(order);

    await request(app).post('/api/orders').set('Authorization', token).send(checkoutBody);

    const { data } = prisma.order.create.mock.calls[0][0];
    expect(data.subtotal).toBe(200);
    expect(data.shipping).toBe(60);
    expect(data.total).toBe(260);
  });

  it('rejects a product that is no longer available with 400', async () => {
    const token = signedIn();
    prisma.product.findMany.mockResolvedValue([]);

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', token)
      .send(checkoutBody);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/no longer available/i);
    expect(prisma.order.create).not.toHaveBeenCalled();
  });

  it('rejects an order that exceeds the available stock with 400', async () => {
    const token = signedIn();
    prisma.product.findMany.mockResolvedValue([{ ...catalogue, stock: 1 }]);

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', token)
      .send(checkoutBody);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/left in stock/i);
    expect(prisma.order.create).not.toHaveBeenCalled();
  });

  it('rejects an empty cart with 400', async () => {
    const token = signedIn();

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', token)
      .send({ ...checkoutBody, items: [] });

    expect(res.status).toBe(400);
    expect(res.body.details[0].message).toBe('Your cart is empty');
  });

  it('rejects a request without a token with 401', async () => {
    const res = await request(app).post('/api/orders').send(checkoutBody);

    expect(res.status).toBe(401);
    expect(prisma.order.create).not.toHaveBeenCalled();
  });
});

describe('GET /api/orders', () => {
  beforeEach(() => reset());

  it('returns the orders that belong to the signed-in customer', async () => {
    const token = signedIn();
    prisma.order.findMany.mockResolvedValue([order]);

    const res = await request(app).get('/api/orders').set('Authorization', token);

    expect(res.status).toBe(200);
    expect(res.body.data.orders).toHaveLength(1);
    expect(prisma.order.findMany.mock.calls[0][0].where).toEqual({ userId: customer.id });
  });

  it('rejects a request without a token with 401', async () => {
    const res = await request(app).get('/api/orders');

    expect(res.status).toBe(401);
  });
});

describe('GET /api/orders/:orderNumber', () => {
  beforeEach(() => reset());

  it('returns the order with its items and customer', async () => {
    const token = signedIn();
    prisma.order.findFirst.mockResolvedValue(order);

    const res = await request(app).get('/api/orders/AUR-TEST-0001').set('Authorization', token);

    expect(res.status).toBe(200);
    expect(res.body.data.order.id).toBe(order.id);
  });

  it('scopes the lookup to the signed-in customer', async () => {
    const token = signedIn();
    prisma.order.findFirst.mockResolvedValue(null);

    await request(app).get('/api/orders/AUR-TEST-0001').set('Authorization', token);

    expect(prisma.order.findFirst.mock.calls[0][0].where.userId).toBe(customer.id);
  });

  it('returns 404 when the order does not exist', async () => {
    const token = signedIn();
    prisma.order.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/orders/UNKNOWN').set('Authorization', token);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Order not found');
  });
});

describe('PATCH /api/orders/:orderNumber/status', () => {
  beforeEach(() => reset());

  it('updates the status for an administrator', async () => {
    prisma.user.findUnique.mockResolvedValue(admin);
    prisma.order.update.mockResolvedValue({ ...order, status: 'SHIPPED' });

    const res = await request(app)
      .patch('/api/orders/AUR-TEST-0001/status')
      .set('Authorization', tokenFor(admin))
      .send({ status: 'SHIPPED' });

    expect(res.status).toBe(200);
    expect(res.body.data.order.status).toBe('SHIPPED');
    expect(prisma.order.update.mock.calls[0][0].where).toEqual({
      orderNumber: 'AUR-TEST-0001',
    });
  });

  it('rejects an unknown status with 400', async () => {
    prisma.user.findUnique.mockResolvedValue(admin);

    const res = await request(app)
      .patch('/api/orders/AUR-TEST-0001/status')
      .set('Authorization', tokenFor(admin))
      .send({ status: 'TELEPORTED' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid order status');
    expect(prisma.order.update).not.toHaveBeenCalled();
  });

  it('refuses a customer with 403', async () => {
    prisma.user.findUnique.mockResolvedValue(customer);

    const res = await request(app)
      .patch('/api/orders/AUR-TEST-0001/status')
      .set('Authorization', tokenFor(customer))
      .send({ status: 'SHIPPED' });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/administrator access required/i);
    expect(prisma.order.update).not.toHaveBeenCalled();
  });
});

describe('GET /api/orders/admin/all', () => {
  beforeEach(() => reset());

  it('returns the order board with pagination for an administrator', async () => {
    prisma.user.findUnique.mockResolvedValue(admin);
    prisma.order.findMany.mockResolvedValue([order]);
    prisma.order.count.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/orders/admin/all?page=1&limit=20')
      .set('Authorization', tokenFor(admin));

    expect(res.status).toBe(200);
    expect(res.body.data.pagination).toEqual({ page: 1, limit: 20, total: 1, pages: 1 });
  });

  it('caps the page size at 100', async () => {
    prisma.user.findUnique.mockResolvedValue(admin);
    prisma.order.findMany.mockResolvedValue([]);
    prisma.order.count.mockResolvedValue(0);

    const res = await request(app)
      .get('/api/orders/admin/all?limit=5000')
      .set('Authorization', tokenFor(admin));

    expect(res.body.data.pagination.limit).toBe(100);
  });

  it('refuses a customer with 403', async () => {
    prisma.user.findUnique.mockResolvedValue(customer);

    const res = await request(app)
      .get('/api/orders/admin/all')
      .set('Authorization', tokenFor(customer));

    expect(res.status).toBe(403);
  });
});
