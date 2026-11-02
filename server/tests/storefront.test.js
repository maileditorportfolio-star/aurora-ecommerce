import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { setupApp, admin, operator, customer, tokenFor } from './helpers/app.js';

const { app, prisma, reset } = setupApp();

const signIn = (user) => {
  prisma.user.findUnique.mockResolvedValue(user);
  return tokenFor(user);
};

describe('GET /api/settings/storefront', () => {
  beforeEach(() => reset());

  it('returns the defaults when no settings row exists', async () => {
    prisma.storefrontSetting.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/settings/storefront');

    expect(res.status).toBe(200);
    expect(res.body.data.settings.heroTitle).toBe('Tech that feels');
    expect(res.body.data.settings.showCategories).toBe(true);
  });

  it('returns the saved settings', async () => {
    prisma.storefrontSetting.findUnique.mockResolvedValue({
      id: 'default',
      announcement: 'Free delivery this week',
      heroEyebrow: 'New drop',
      heroTitle: 'Built for work',
      heroHighlight: 'and play',
      heroDescription: 'A different description',
      heroProductSlug: 'beacon-mesh-router',
      showMarquee: false,
      showCategories: false,
      showFeatures: true,
    });

    const res = await request(app).get('/api/settings/storefront');

    expect(res.body.data.settings.announcement).toBe('Free delivery this week');
    expect(res.body.data.settings.showMarquee).toBe(false);
    expect(res.body.data.settings.heroProductSlug).toBe('beacon-mesh-router');
  });
});

describe('PATCH /api/admin/storefront', () => {
  beforeEach(() => reset());

  it('lets the super admin update the storefront copy', async () => {
    signIn(admin);
    prisma.storefrontSetting.upsert.mockImplementation(async ({ update }) => ({
      id: 'default',
      announcement: 'Updated announcement',
      heroEyebrow: 'Updated eyebrow',
      heroTitle: 'Updated title',
      heroHighlight: 'highlight',
      heroDescription: 'Updated description',
      heroProductSlug: null,
      showMarquee: true,
      showCategories: true,
      showFeatures: true,
      ...update,
    }));

    const res = await request(app)
      .patch('/api/admin/storefront')
      .set('Authorization', tokenFor(admin))
      .send({
        announcement: 'Updated announcement',
        heroTitle: 'Updated title',
        showCategories: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.settings.announcement).toBe('Updated announcement');
    expect(res.body.data.settings.showCategories).toBe(false);
  });

  it('allows an admin with design.write', async () => {
    const designer = { ...operator, permissions: ['design.write'] };
    signIn(designer);
    prisma.storefrontSetting.upsert.mockResolvedValue({
      id: 'default',
      announcement: 'Design admin',
      heroEyebrow: 'Eyebrow',
      heroTitle: 'Title',
      heroHighlight: 'highlight',
      heroDescription: 'Description',
      heroProductSlug: null,
      showMarquee: true,
      showCategories: true,
      showFeatures: true,
    });

    const res = await request(app)
      .patch('/api/admin/storefront')
      .set('Authorization', tokenFor(designer))
      .send({ announcement: 'Design admin' });

    expect(res.status).toBe(200);
  });

  it('rejects an admin without design.write and a customer', async () => {
    signIn(operator);
    const asOperator = await request(app)
      .patch('/api/admin/storefront')
      .set('Authorization', tokenFor(operator))
      .send({ announcement: 'Nope' });
    expect(asOperator.status).toBe(403);

    signIn(customer);
    const asCustomer = await request(app)
      .patch('/api/admin/storefront')
      .set('Authorization', tokenFor(customer))
      .send({ announcement: 'Nope' });
    expect(asCustomer.status).toBe(403);
  });

  it('validates empty copy', async () => {
    signIn(admin);

    const res = await request(app)
      .patch('/api/admin/storefront')
      .set('Authorization', tokenFor(admin))
      .send({ heroTitle: '' });

    expect(res.status).toBe(400);
  });
});
