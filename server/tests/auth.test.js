import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { setupApp, customer, tokenFor } from './helpers/app.js';

const { app, prisma, reset } = setupApp();

const validBody = {
  name: 'New Customer',
  email: 'new.customer@aurora.com',
  password: 'password123',
};

describe('POST /api/auth/register', () => {
  beforeEach(() => reset());

  it('creates the account and returns a token', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(async ({ data }) => ({
      id: 'user-new',
      role: 'CUSTOMER',
      avatarUrl: null,
      ...data,
    }));

    const res = await request(app).post('/api/auth/register').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('new.customer@aurora.com');
    expect(res.body.data.user.role).toBe('CUSTOMER');
    expect(res.body.data.token).toEqual(expect.any(String));
  });

  it('never returns the password hash to the client', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(async ({ data }) => ({
      id: 'user-new',
      role: 'CUSTOMER',
      avatarUrl: null,
      ...data,
    }));

    const res = await request(app).post('/api/auth/register').send(validBody);

    expect(res.body.data.user).not.toHaveProperty('passwordHash');
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('stores a bcrypt hash rather than the plain password', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(async ({ data }) => ({
      id: 'user-new',
      role: 'CUSTOMER',
      ...data,
    }));

    await request(app).post('/api/auth/register').send(validBody);

    const { data } = prisma.user.create.mock.calls[0][0];
    expect(data.passwordHash).not.toBe(validBody.password);
    expect(data.passwordHash).toMatch(/^\$2[aby]\$/);
  });

  it('rejects an email that is already registered with 409', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-existing' });

    const res = await request(app).post('/api/auth/register').send(validBody);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('rejects a password shorter than 8 characters with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validBody, password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('rejects a malformed email address with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validBody, email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.details).toEqual([{ field: 'email', message: 'Enter a valid email address' }]);
  });

  it('rejects a missing name with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: validBody.email, password: validBody.password });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(() => reset());

  it('returns the profile and a token for valid credentials', async () => {
    const passwordHash = await bcrypt.hash('password123', 4);
    prisma.user.findUnique.mockResolvedValue({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      role: 'CUSTOMER',
      avatarUrl: null,
      passwordHash,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: customer.email, password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(customer.email);
    expect(res.body.data.token).toEqual(expect.any(String));
  });

  it('rejects an unknown email with 401', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@aurora.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  it('rejects a wrong password with 401', async () => {
    const passwordHash = await bcrypt.hash('password123', 4);
    prisma.user.findUnique.mockResolvedValue({
      id: customer.id,
      email: customer.email,
      role: 'CUSTOMER',
      passwordHash,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: customer.email, password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });
});

describe('GET /api/auth/me', () => {
  beforeEach(() => reset());

  it('returns the signed-in profile', async () => {
    prisma.user.findUnique.mockResolvedValue(customer);

    const res = await request(app).get('/api/auth/me').set('Authorization', tokenFor(customer));

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(customer.email);
  });

  it('rejects a request without a token with 401', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects a malformed token with 401', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-token');

    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/auth/password', () => {
  beforeEach(() => reset());

  it('updates the stored hash when the current password matches', async () => {
    const passwordHash = await bcrypt.hash('password123', 4);
    prisma.user.findUnique.mockResolvedValue({ ...customer, passwordHash });
    prisma.user.update.mockResolvedValue({ ...customer });

    const res = await request(app)
      .patch('/api/auth/password')
      .set('Authorization', tokenFor(customer))
      .send({ currentPassword: 'password123', newPassword: 'newpassword456' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { where, data } = prisma.user.update.mock.calls[0][0];
    expect(where).toEqual({ id: customer.id });
    expect(data.passwordHash).not.toBe('newpassword456');
  });

  it('rejects an incorrect current password with 400', async () => {
    const passwordHash = await bcrypt.hash('password123', 4);
    prisma.user.findUnique.mockResolvedValue({ ...customer, passwordHash });

    const res = await request(app)
      .patch('/api/auth/password')
      .set('Authorization', tokenFor(customer))
      .send({ currentPassword: 'not-my-password', newPassword: 'newpassword456' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/incorrect/i);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('rejects a new password shorter than 8 characters with 400', async () => {
    prisma.user.findUnique.mockResolvedValue(customer);

    const res = await request(app)
      .patch('/api/auth/password')
      .set('Authorization', tokenFor(customer))
      .send({ currentPassword: 'password123', newPassword: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/8\+ characters/i);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
