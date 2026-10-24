import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { setupApp } from './helpers/app.js';

const { app, prisma, reset } = setupApp();

describe('GET /api/metrics', () => {
  beforeEach(() => reset());

  it('returns process and catalogue metrics', async () => {
    prisma.user.count.mockResolvedValue(12);
    prisma.product.count.mockResolvedValue(42);
    prisma.order.count.mockResolvedValue(7);
    prisma.category.count.mockResolvedValue(5);

    const res = await request(app).get('/api/metrics');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('uptime');
    expect(res.body.data.pid).toBe(process.pid);
    expect(res.body.data.memory).toHaveProperty('heapUsed');
    expect(res.body.data.catalogue).toEqual({
      users: 12,
      products: 42,
      orders: 7,
      categories: 5,
    });
    expect(res.body.data).toHaveProperty('timestamp');
  });

  it('exposes the node version and rss memory', async () => {
    prisma.user.count.mockResolvedValue(0);
    prisma.product.count.mockResolvedValue(0);
    prisma.order.count.mockResolvedValue(0);
    prisma.category.count.mockResolvedValue(0);

    const res = await request(app).get('/api/metrics');

    expect(res.body.data.nodeVersion).toBe(process.version);
    expect(typeof res.body.data.memory.rss).toBe('number');
    expect(res.body.data.memory.rss).toBeGreaterThan(0);
  });
});
