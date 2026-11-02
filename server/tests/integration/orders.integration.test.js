import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { request, app, createProduct, uniqueSuffix, removeFixtures } from './helpers.js';

const email = `integration-orders-${uniqueSuffix()}@aurora.test`;
const password = 'integration-password';

let product;
let userId;
let token;
let orderNumber;

beforeAll(async () => {
  product = await createProduct();

  const registration = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Integration Orders User', email, password });

  expect(registration.status).toBe(201);
  userId = registration.body.data.user.id;
  token = registration.body.data.token;
});

afterAll(async () => {
  await removeFixtures({ userId, productId: product.id });
});

describe('live orders API', () => {
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
        items: [{ productId: product.id, quantity: 2 }],
        shippingName: 'Integration Orders User',
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

    const refreshed = await request(app).get(`/api/products/${product.slug}`);
    expect(refreshed.body.data.product.stock).toBe(3);

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
