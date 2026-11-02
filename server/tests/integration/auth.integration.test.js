import { describe, it, expect, afterAll } from 'vitest';
import { request, app, uniqueSuffix, removeFixtures } from './helpers.js';

const email = `integration-${uniqueSuffix()}@aurora.test`;
const password = 'integration-password';

let userId;
let token;

afterAll(async () => {
  await removeFixtures({ userId });
});

describe('live auth API', () => {
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
});
