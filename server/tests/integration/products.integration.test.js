import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { request, app, createProduct, removeFixtures } from './helpers.js';

let product;

beforeAll(async () => {
  product = await createProduct();
});

afterAll(async () => {
  await removeFixtures({ productId: product.id });
});

describe('live products API', () => {
  it('serves a product created directly in the database', async () => {
    const response = await request(app).get(`/api/products/${product.slug}`);

    expect(response.status).toBe(200);
    expect(response.body.data.product.id).toBe(product.id);
    expect(response.body.data.product.stock).toBe(5);
  });

  it('finds the product through the catalogue search', async () => {
    const response = await request(app)
      .get('/api/products')
      .query({ search: product.name, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body.data.items.map((item) => item.id)).toContain(product.id);
  });
});
