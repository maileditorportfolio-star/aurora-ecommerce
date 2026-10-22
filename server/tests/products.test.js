import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { setupApp, admin, customer, product, tokenFor } from './helpers/app.js';

const { app, prisma, reset } = setupApp();

const category = { id: 'category-1', name: 'Laptops', slug: 'laptops' };

const signedInAdmin = () => {
  prisma.user.findUnique.mockResolvedValue(admin);
  return tokenFor(admin);
};

describe('GET /api/products', () => {
  beforeEach(() => reset());

  it('returns the catalogue with its categories and pagination', async () => {
    prisma.product.findMany.mockResolvedValue([product]);
    prisma.product.count.mockResolvedValue(1);
    prisma.category.findMany.mockResolvedValue([category]);

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.categories).toEqual([category]);
    expect(res.body.data.pagination).toEqual({ page: 1, limit: 12, total: 1, pages: 1 });
  });

  it('only ever returns active products', async () => {
    prisma.product.findMany.mockResolvedValue([]);
    prisma.product.count.mockResolvedValue(0);
    prisma.category.findMany.mockResolvedValue([]);

    await request(app).get('/api/products');

    expect(prisma.product.findMany.mock.calls[0][0].where.active).toBe(true);
  });

  it('filters by search term across name, description and sku', async () => {
    prisma.product.findMany.mockResolvedValue([]);
    prisma.product.count.mockResolvedValue(0);
    prisma.category.findMany.mockResolvedValue([]);

    await request(app).get('/api/products?search=ultrabook');

    const { where } = prisma.product.findMany.mock.calls[0][0];
    expect(where.OR).toEqual([
      { name: { contains: 'ultrabook' } },
      { description: { contains: 'ultrabook' } },
      { sku: { contains: 'ultrabook' } },
    ]);
  });

  it('filters by category slug and the featured flag', async () => {
    prisma.product.findMany.mockResolvedValue([]);
    prisma.product.count.mockResolvedValue(0);
    prisma.category.findMany.mockResolvedValue([]);

    await request(app).get('/api/products?category=laptops&featured=true');

    const { where } = prisma.product.findMany.mock.calls[0][0];
    expect(where.category).toEqual({ slug: 'laptops' });
    expect(where.featured).toBe(true);
  });

  it('sorts by price when asked', async () => {
    prisma.product.findMany.mockResolvedValue([]);
    prisma.product.count.mockResolvedValue(0);
    prisma.category.findMany.mockResolvedValue([]);

    await request(app).get('/api/products?sort=price-asc');

    expect(prisma.product.findMany.mock.calls[0][0].orderBy).toEqual({ price: 'asc' });
  });

  it('caps the page size at 48', async () => {
    prisma.product.findMany.mockResolvedValue([]);
    prisma.product.count.mockResolvedValue(0);
    prisma.category.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/products?limit=500');

    expect(res.body.data.pagination.limit).toBe(48);
  });
});

describe('GET /api/products/:slug', () => {
  beforeEach(() => reset());

  it('returns the product together with related items', async () => {
    prisma.product.findFirst.mockResolvedValue(product);
    prisma.product.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/products/aurora-pro-14-ultrabook');

    expect(res.status).toBe(200);
    expect(res.body.data.product.id).toBe(product.id);
    expect(res.body.data.related).toEqual([]);
  });

  it('looks the product up by slug or id', async () => {
    prisma.product.findFirst.mockResolvedValue(product);
    prisma.product.findMany.mockResolvedValue([]);

    await request(app).get('/api/products/aurora-pro-14-ultrabook');

    expect(prisma.product.findFirst.mock.calls[0][0].where.OR).toEqual([
      { slug: 'aurora-pro-14-ultrabook' },
      { id: 'aurora-pro-14-ultrabook' },
    ]);
  });

  it('returns 404 when the product is missing', async () => {
    prisma.product.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/products/nope');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Product not found');
  });
});

describe('GET /api/products/categories', () => {
  beforeEach(() => reset());

  it('lists the categories with their product counts', async () => {
    prisma.category.findMany.mockResolvedValue([{ ...category, _count: { products: 4 } }]);

    const res = await request(app).get('/api/products/categories');

    expect(res.status).toBe(200);
    expect(res.body.data.categories[0]._count.products).toBe(4);
  });
});

describe('POST /api/products', () => {
  beforeEach(() => reset());

  it('creates a product with a slug derived from the name', async () => {
    const token = signedInAdmin();
    prisma.product.findUnique.mockResolvedValue(null);
    prisma.product.create.mockResolvedValue(product);

    const res = await request(app).post('/api/products').set('Authorization', token).send({
      name: 'Aurora Pro 14 Ultrabook',
      description: 'A 14-inch ultrabook with a 120Hz LTPO display and all-day battery.',
      price: 118000,
      stock: 18,
      categoryId: category.id,
    });

    expect(res.status).toBe(201);
    expect(res.body.data.product.id).toBe(product.id);

    const { data } = prisma.product.create.mock.calls[0][0];
    expect(data.slug).toBe('aurora-pro-14-ultrabook');
    expect(data.compareAtPrice).toBeNull();
    expect(data.featured).toBe(false);
  });

  it('suffixes the slug when it is already taken', async () => {
    const token = signedInAdmin();
    prisma.product.findUnique.mockResolvedValueOnce({ id: 'other-product' });
    prisma.product.findUnique.mockResolvedValueOnce(null);
    prisma.product.create.mockResolvedValue(product);

    await request(app).post('/api/products').set('Authorization', token).send({
      name: 'Aurora Pro 14 Ultrabook',
      description: 'A 14-inch ultrabook with a 120Hz LTPO display and all-day battery.',
      price: 118000,
    });

    const { data } = prisma.product.create.mock.calls[0][0];
    expect(data.slug).toBe('aurora-pro-14-ultrabook-2');
  });

  it('rejects a product with an invalid price with 400', async () => {
    const token = signedInAdmin();

    const res = await request(app).post('/api/products').set('Authorization', token).send({
      name: 'Broken product',
      description: 'A description that is long enough to pass validation.',
      price: -5,
    });

    expect(res.status).toBe(400);
    expect(prisma.product.create).not.toHaveBeenCalled();
  });

  it('refuses a customer with 403', async () => {
    prisma.user.findUnique.mockResolvedValue(customer);

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', tokenFor(customer))
      .send({
        name: 'Aurora Pro 14 Ultrabook',
        description: 'A 14-inch ultrabook with a 120Hz LTPO display and all-day battery.',
        price: 118000,
      });

    expect(res.status).toBe(403);
    expect(prisma.product.create).not.toHaveBeenCalled();
  });

  it('rejects a request without a token with 401', async () => {
    const res = await request(app).post('/api/products').send({ name: 'x' });

    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/products/:id', () => {
  beforeEach(() => reset());

  it('updates the product', async () => {
    const token = signedInAdmin();
    prisma.product.update.mockResolvedValue({ ...product, price: 99000 });

    const res = await request(app)
      .patch('/api/products/product-1')
      .set('Authorization', token)
      .send({ price: 99000 });

    expect(res.status).toBe(200);
    expect(res.body.data.product.price).toBe(99000);
    expect(prisma.product.update.mock.calls[0][0].where).toEqual({ id: 'product-1' });
  });

  it('refuses a customer with 403', async () => {
    prisma.user.findUnique.mockResolvedValue(customer);

    const res = await request(app)
      .patch('/api/products/product-1')
      .set('Authorization', tokenFor(customer))
      .send({ price: 99000 });

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/products/:id', () => {
  beforeEach(() => reset());

  it('archives the product instead of removing it', async () => {
    const token = signedInAdmin();
    prisma.product.update.mockResolvedValue({ ...product, active: false });

    const res = await request(app).delete('/api/products/product-1').set('Authorization', token);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Product archived');
    expect(prisma.product.update.mock.calls[0][0].data).toEqual({ active: false });
  });

  it('refuses a customer with 403', async () => {
    prisma.user.findUnique.mockResolvedValue(customer);

    const res = await request(app)
      .delete('/api/products/product-1')
      .set('Authorization', tokenFor(customer));

    expect(res.status).toBe(403);
    expect(prisma.product.update).not.toHaveBeenCalled();
  });
});
