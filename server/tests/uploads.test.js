import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setupApp, admin, customer, tokenFor } from './helpers/app.js';

const { app, prisma, reset } = setupApp();
const uploadDirectory = fileURLToPath(new URL('../uploads', import.meta.url));

const signIn = (user) => {
  prisma.user.findUnique.mockResolvedValue(user);
  return tokenFor(user);
};

const png = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');

describe('POST /api/admin/uploads/product-image', () => {
  beforeEach(() => reset());

  it('stores an image and returns its public URL', async () => {
    const token = signIn(admin);

    const res = await request(app)
      .post('/api/admin/uploads/product-image')
      .set('Authorization', token)
      .attach('image', png, { filename: 'product.png', contentType: 'image/png' });

    expect(res.status).toBe(201);
    expect(res.body.data.url).toMatch(/\/uploads\/.+\.png$/);

    const filename = res.body.data.url.split('/').pop();
    fs.rmSync(path.join(uploadDirectory, filename), { force: true });
  });

  it('rejects non-image files', async () => {
    const token = signIn(admin);

    const res = await request(app)
      .post('/api/admin/uploads/product-image')
      .set('Authorization', token)
      .attach('image', Buffer.from('hello'), { filename: 'note.txt', contentType: 'text/plain' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/images are allowed/i);
  });

  it('rejects customers and anonymous requests', async () => {
    signIn(customer);
    const asCustomer = await request(app)
      .post('/api/admin/uploads/product-image')
      .set('Authorization', tokenFor(customer))
      .attach('image', png, { filename: 'product.png', contentType: 'image/png' });
    expect(asCustomer.status).toBe(403);

    const anonymous = await request(app)
      .post('/api/admin/uploads/product-image')
      .attach('image', png, { filename: 'product.png', contentType: 'image/png' });
    expect(anonymous.status).toBe(401);
  });
});
