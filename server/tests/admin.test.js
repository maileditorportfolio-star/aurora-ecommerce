import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { setupApp, admin, customer, tokenFor } from './helpers/app.js';

const { app, prisma, reset } = setupApp();

const signedInAdmin = () => {
  prisma.user.findUnique.mockResolvedValue(admin);
  return tokenFor(admin);
};

const deliveredOrder = {
  id: 'order-1',
  total: 5000,
  status: 'DELIVERED',
  createdAt: new Date().toISOString(),
  items: [{ name: 'Aurora Pro 14 Ultrabook', quantity: 2 }],
};

const pendingOrder = {
  id: 'order-2',
  total: 3000,
  status: 'PENDING',
  createdAt: new Date().toISOString(),
  items: [{ name: 'Aurora Buds Pro', quantity: 1 }],
};

describe('GET /api/admin/stats', () => {
  beforeEach(() => reset());

  it('summarises revenue, pipeline and counts for the dashboard', async () => {
    const token = signedInAdmin();
    prisma.order.findMany.mockResolvedValue([deliveredOrder, pendingOrder]);
    prisma.product.count.mockResolvedValue(10);
    prisma.user.count.mockResolvedValue(42);
    prisma.category.count.mockResolvedValue(5);
    prisma.product.findMany.mockResolvedValue([
      { id: 'p1', name: 'Aurora Pro 14 Ultrabook', stock: 12, price: 118000 },
    ]);

    const res = await request(app).get('/api/admin/stats').set('Authorization', token);

    expect(res.status).toBe(200);
    expect(res.body.data.totals.revenue).toBe(5000);
    expect(res.body.data.totals.pipeline).toBe(3000);
    expect(res.body.data.totals.orders).toBe(2);
    expect(res.body.data.totals.products).toBe(10);
    expect(res.body.data.totals.customers).toBe(42);
    expect(res.body.data.totals.categories).toBe(5);
  });

  it('reports six months of revenue history', async () => {
    const token = signedInAdmin();
    prisma.order.findMany.mockResolvedValue([deliveredOrder]);
    prisma.product.count.mockResolvedValue(1);
    prisma.user.count.mockResolvedValue(1);
    prisma.category.count.mockResolvedValue(1);
    prisma.product.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/admin/stats').set('Authorization', token);

    expect(res.body.data.revenueByMonth).toHaveLength(6);
    expect(res.body.data.revenueByMonth[5].revenue).toBe(5000);
  });

  it('lists the order status counts', async () => {
    const token = signedInAdmin();
    prisma.order.findMany.mockResolvedValue([deliveredOrder, pendingOrder]);
    prisma.product.count.mockResolvedValue(1);
    prisma.user.count.mockResolvedValue(1);
    prisma.category.count.mockResolvedValue(1);
    prisma.product.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/admin/stats').set('Authorization', token);

    const counts = Object.fromEntries(
      res.body.data.statusCounts.map((entry) => [entry.status, entry.count]),
    );
    expect(counts.DELIVERED).toBe(1);
    expect(counts.PENDING).toBe(1);
    expect(counts.CANCELLED).toBe(0);
  });

  it('flags products that are running low on stock', async () => {
    const token = signedInAdmin();
    prisma.order.findMany.mockResolvedValue([]);
    prisma.product.count.mockResolvedValue(2);
    prisma.user.count.mockResolvedValue(1);
    prisma.category.count.mockResolvedValue(1);
    prisma.product.findMany.mockResolvedValue([
      { id: 'p1', name: 'Aurora Pro 14 Ultrabook', stock: 3, price: 118000 },
      { id: 'p2', name: 'Aurora Buds Pro', stock: 40, price: 4000 },
    ]);

    const res = await request(app).get('/api/admin/stats').set('Authorization', token);

    expect(res.body.data.lowStock).toHaveLength(1);
    expect(res.body.data.lowStock[0].name).toBe('Aurora Pro 14 Ultrabook');
  });

  it('refuses a customer with 403', async () => {
    prisma.user.findUnique.mockResolvedValue(customer);

    const res = await request(app).get('/api/admin/stats').set('Authorization', tokenFor(customer));

    expect(res.status).toBe(403);
  });

  it('rejects a request without a token with 401', async () => {
    const res = await request(app).get('/api/admin/stats');

    expect(res.status).toBe(401);
  });
});

describe('GET /api/admin/customers', () => {
  beforeEach(() => reset());

  it('returns the customer list with lifetime order value', async () => {
    const token = signedInAdmin();
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'user-customer',
        name: 'Demo Customer',
        email: 'customer@aurora.com',
        _count: { orders: 2 },
      },
    ]);
    prisma.user.count.mockResolvedValue(1);
    prisma.order.findMany.mockResolvedValue([{ total: 2500 }, { total: 1500 }]);

    const res = await request(app).get('/api/admin/customers').set('Authorization', token);

    expect(res.status).toBe(200);
    expect(res.body.data.customers[0].orderCount).toBe(2);
    expect(res.body.data.customers[0].lifetimeValue).toBe(4000);
  });

  it('searches by name, email and phone', async () => {
    const token = signedInAdmin();
    prisma.user.findMany.mockResolvedValue([]);
    prisma.user.count.mockResolvedValue(0);

    await request(app).get('/api/admin/customers?search=demo').set('Authorization', token);

    const { where } = prisma.user.findMany.mock.calls[0][0];
    expect(where.OR).toEqual([
      { name: { contains: 'demo' } },
      { email: { contains: 'demo' } },
      { phone: { contains: 'demo' } },
    ]);
  });

  it('only ever lists customer accounts', async () => {
    const token = signedInAdmin();
    prisma.user.findMany.mockResolvedValue([]);
    prisma.user.count.mockResolvedValue(0);

    await request(app).get('/api/admin/customers').set('Authorization', token);

    expect(prisma.user.findMany.mock.calls[0][0].where.role).toBe('CUSTOMER');
  });

  it('refuses a customer with 403', async () => {
    prisma.user.findUnique.mockResolvedValue(customer);

    const res = await request(app)
      .get('/api/admin/customers')
      .set('Authorization', tokenFor(customer));

    expect(res.status).toBe(403);
  });
});
