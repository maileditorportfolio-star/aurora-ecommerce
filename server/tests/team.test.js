import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { setupApp, admin, operator, customer, tokenFor } from './helpers/app.js';

const { app, prisma, reset } = setupApp();

const signIn = (user) => {
  prisma.user.findUnique.mockResolvedValue(user);
  return tokenFor(user);
};

describe('GET /api/admin/users', () => {
  beforeEach(() => reset());

  it('lists staff accounts for the super admin', async () => {
    const token = signIn(admin);
    prisma.user.findMany.mockResolvedValue([admin, operator]);

    const res = await request(app).get('/api/admin/users').set('Authorization', token);

    expect(res.status).toBe(200);
    expect(res.body.data.users).toHaveLength(2);
    expect(res.body.data.users[1].role).toBe('ADMIN');
    expect(res.body.data.users[1].permissions).toEqual(['products.write', 'orders.read']);
  });

  it('exposes the permission catalogue to the super admin', async () => {
    const token = signIn(admin);

    const res = await request(app).get('/api/admin/users/permissions').set('Authorization', token);

    expect(res.status).toBe(200);
    expect(res.body.data.permissions).toContain('design.write');
  });

  it('rejects a standard admin and a customer', async () => {
    prisma.user.findUnique.mockResolvedValue(operator);
    const asOperator = await request(app)
      .get('/api/admin/users')
      .set('Authorization', tokenFor(operator));
    expect(asOperator.status).toBe(403);

    prisma.user.findUnique.mockResolvedValue(customer);
    const asCustomer = await request(app)
      .get('/api/admin/users')
      .set('Authorization', tokenFor(customer));
    expect(asCustomer.status).toBe(403);
  });
});

describe('POST /api/admin/users', () => {
  beforeEach(() => reset());

  it('creates an admin with the selected permissions', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(admin).mockResolvedValueOnce(null);
    prisma.user.create.mockImplementation(async ({ data }) => ({
      id: 'user-new',
      createdAt: new Date().toISOString(),
      ...data,
    }));

    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', tokenFor(admin))
      .send({
        name: 'Ops Admin',
        email: 'ops@aurora.com',
        password: 'password123',
        permissions: ['products.write', 'design.write'],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('ADMIN');
    expect(res.body.data.user.permissions).toEqual(['products.write', 'design.write']);

    const { data } = prisma.user.create.mock.calls[0][0];
    expect(data.role).toBe('ADMIN');
    expect(data.passwordHash).not.toBe('password123');
    expect(data.permissions).toEqual(['products.write', 'design.write']);
  });

  it('rejects unknown permissions and duplicate emails', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(admin).mockResolvedValueOnce(null);

    const invalid = await request(app)
      .post('/api/admin/users')
      .set('Authorization', tokenFor(admin))
      .send({
        name: 'Ops Admin',
        email: 'ops@aurora.com',
        password: 'password123',
        permissions: ['root.everything'],
      });

    expect(invalid.status).toBe(400);

    reset();
    prisma.user.findUnique.mockResolvedValueOnce(admin).mockResolvedValueOnce({ id: 'existing' });
    const duplicate = await request(app)
      .post('/api/admin/users')
      .set('Authorization', tokenFor(admin))
      .send({ name: 'Ops Admin', email: 'ops@aurora.com', password: 'password123' });

    expect(duplicate.status).toBe(409);
  });

  it('rejects a standard admin', async () => {
    prisma.user.findUnique.mockResolvedValue(operator);

    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', tokenFor(operator))
      .send({ name: 'Ops Admin', email: 'ops@aurora.com', password: 'password123' });

    expect(res.status).toBe(403);
  });
});

describe('PATCH /api/admin/users/:id', () => {
  beforeEach(() => reset());

  it('updates the permissions of a standard admin', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(admin).mockResolvedValueOnce(operator);
    prisma.user.update.mockResolvedValue({
      ...operator,
      permissions: ['design.write'],
    });

    const res = await request(app)
      .patch(`/api/admin/users/${operator.id}`)
      .set('Authorization', tokenFor(admin))
      .send({ permissions: ['design.write'] });

    expect(res.status).toBe(200);
    expect(res.body.data.user.permissions).toEqual(['design.write']);
  });

  it('refuses to edit the super admin account', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(admin).mockResolvedValueOnce(admin);

    const res = await request(app)
      .patch(`/api/admin/users/${admin.id}`)
      .set('Authorization', tokenFor(admin))
      .send({ permissions: ['design.write'] });

    expect(res.status).toBe(403);
  });
});
