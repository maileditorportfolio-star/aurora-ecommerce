import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { setupApp, customer, admin } from './helpers/app.js';
import { nodeRequire } from './helpers/prisma-mock.js';

setupApp();

const env = nodeRequire('../../src/config/env.js');
const ApiError = nodeRequire('../../src/utils/ApiError.js');
const { signToken, verifyToken, readToken } = nodeRequire('../../src/services/token.service.js');

describe('signToken', () => {
  it('embeds the user id, email and role in the payload', () => {
    const token = signToken(admin);
    const payload = jwt.verify(token, env.jwt.secret);

    expect(payload.sub).toBe(admin.id);
    expect(payload.email).toBe(admin.email);
    expect(payload.role).toBe(admin.role);
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  it('never embeds the password hash', () => {
    const token = signToken({ ...customer, passwordHash: '$2b$12$should-not-leak' });

    expect(token).not.toContain('passwordHash');
    expect(jwt.verify(token, env.jwt.secret)).not.toHaveProperty('passwordHash');
  });
});

describe('verifyToken', () => {
  it('round-trips a signed token', () => {
    const payload = verifyToken(signToken(customer));

    expect(payload.sub).toBe(customer.id);
    expect(payload.email).toBe(customer.email);
  });

  it('rejects a token signed with a different secret', () => {
    const foreign = jwt.sign({ sub: customer.id }, 'some-other-secret', { expiresIn: '1h' });

    expect(() => verifyToken(foreign)).toThrow(ApiError);
    expect(() => verifyToken(foreign)).toThrow('Invalid authentication token');
  });

  it('asks the customer to sign in again when the session has expired', () => {
    const expired = jwt.sign({ sub: customer.id }, env.jwt.secret, { expiresIn: '-1s' });

    expect(() => verifyToken(expired)).toThrow('Session expired, please sign in again');
  });

  it('marks authentication failures as 401', () => {
    try {
      verifyToken('not-a-jwt');
    } catch (error) {
      expect(error.statusCode).toBe(401);
    }
  });
});

describe('readToken', () => {
  it('reads a bearer header', () => {
    expect(readToken({ headers: { authorization: 'Bearer abc.def.ghi' } })).toBe('abc.def.ghi');
  });

  it('ignores non-bearer authorization schemes', () => {
    expect(readToken({ headers: { authorization: 'Basic dXNlcjpwYXNz' } })).toBeNull();
  });

  it('falls back to the token cookie', () => {
    expect(readToken({ headers: {}, cookies: { token: 'cookie-token' } })).toBe('cookie-token');
  });

  it('returns null when no credentials are present', () => {
    expect(readToken({ headers: {} })).toBeNull();
  });
});
