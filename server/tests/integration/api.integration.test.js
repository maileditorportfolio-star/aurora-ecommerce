import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createRequire } from 'node:module';

process.env.NODE_ENV = 'test';
process.env.AUTH_RATE_LIMIT = '1000';
process.env.BCRYPT_ROUNDS = '4';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'integration-test-secret-aurora-commerce';

const nodeRequire = createRequire(import.meta.url);
const request = nodeRequire('supertest');
const app = nodeRequire('../../src/app.js');
const prisma = nodeRequire('../../src/config/prisma.js');

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const email = `integration-${suffix}@aurora.test`;
const password = 'integration-password';
const productSlug = `integration-product-${suffix}`;

let token;
let userId;
let productId;
let orderNumber;

beforeAll(async () => {
  const category = await prisma.category.findFirst();
  const product = await prisma.product.create({
    data: {
      name: `Integration Product ${suffix}`,
      slug: productSlug,
      description: 'Created by the database integration suite and removed afterwards.',
      price: 1000,
      stock: 5,
      active: true,
      categoryId: category?.id ?? null,
    },
  });
  productId = product.id;
});

afterAll(async () => {
  if (userId) {
    await prisma.order.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  }
  if (productId) {
    await prisma.product.deleteMany({ where: { id: productId } });
  }
  await prisma.$disconnect();
});

describe('live API against MySQL', () => {
  it('reports the database as healthy', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.database).toBe('up');
  });

  it('serves a product created directly in the database', async () => {
    const response = await request(app).get(`/api/products/${productSlug}`);

    expect(response.status).toBe(200);
    expect(response.body.data.product.id).toBe(productId);
    expect(response.body.data.product.stock).toBe(5);
  });

  it('registers a customer and returns a usable token', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Integration User', email, password, phone: '+8801700000000' });

    expect(response.status).toBe(201);
    expect(response.body.data.user.email).toBe(email);
    userId = response.body.data.user.id;
    token = response.body.data.token;
    expect(token).toBeTruthy();
  });

  it('rejects a duplicate registration', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Integration User', email, password });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  it('logs in and resolves the profile from the token', async () => {
    const login = await request(app).post('/api/auth/login').send({ email, password });
    expect(login.status).toBe(200);
    expect(login.body.data.token).toBeTruthy();

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.data.token}`);

    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe(email);
  });

  it('guards the order endpoints', async () => {
    const response = await request(app).get('/api/orders');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('validates the checkout payload before touching the database', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [] });

    expect(response.status).toBe(400);
    expect(response.body.details.length).toBeGreaterThan(0);
  });

  it('creates an order, decrements stock and lists it for the customer', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId, quantity: 2 }],
        shippingName: 'Integration User',
        shippingPhone: '01700000000',
        shippingAddress: 'House 1, Road 2, Dhaka 1207',
        shippingCity: 'Dhaka',
        shippingZip: '1207',
        paymentMethod: 'cod',
      });

    expect(response.status).toBe(201);
    const order = response.body.data.order;
    orderNumber = order.orderNumber;
    expect(order.orderNumber).toMatch(/^AUR-/);
    expect(order.items).toHaveLength(1);
    expect(order.items[0].quantity).toBe(2);
    expect(order.subtotal).toBe(2000);
    expect(order.total).toBe(order.subtotal + order.shipping + order.tax);

    const refreshed = await prisma.product.findUnique({ where: { id: productId } });
    expect(refreshed.stock).toBe(3);

    const mine = await request(app).get('/api/orders').set('Authorization', `Bearer ${token}`);

    expect(mine.status).toBe(200);
    expect(mine.body.data.orders.map((entry) => entry.orderNumber)).toContain(orderNumber);

    const detail = await request(app)
      .get(`/api/orders/${orderNumber}`)
      .set('Authorization', `Bearer ${token}`);

    expect(detail.status).toBe(200);
    expect(detail.body.data.order.orderNumber).toBe(orderNumber);
  });
});
