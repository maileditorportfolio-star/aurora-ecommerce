import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, ApiError, getToken, setToken, TOKEN_KEY, API_URL } from '@/lib/api';

type JsonPayload = unknown;

const jsonResponse = (status: number, payload: JsonPayload): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name: string) => (name === 'content-type' ? 'application/json' : null) },
    json: async () => payload,
  }) as unknown as Response;

const fetchMock = vi.fn();

const lastCall = () => {
  const [url, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
  return { url: String(url), init: init as RequestInit };
};

describe('token storage', () => {
  it('stores and reads the API token from localStorage', () => {
    setToken('jwt-token');

    expect(window.localStorage.getItem(TOKEN_KEY)).toBe('jwt-token');
    expect(getToken()).toBe('jwt-token');
  });

  it('removes the token when asked to clear it', () => {
    setToken('jwt-token');
    setToken(null);

    expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(getToken()).toBeNull();
  });
});

describe('api client', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('targets the configured API origin', () => {
    expect(API_URL).toBe(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
  });

  it('unwraps the { success, data } envelope', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { success: true, data: { items: [] } }));

    await expect(api.products.list()).resolves.toEqual({ items: [] });
    expect(lastCall().url).toBe(`${API_URL}/api/products`);
  });

  it('serialises query parameters and drops empty values', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { success: true, data: { items: [] } }));

    await api.products.list({
      search: 'aurora pro',
      page: 2,
      featured: true,
      category: undefined,
      sort: '',
    });

    expect(lastCall().url).toBe(`${API_URL}/api/products?search=aurora+pro&page=2&featured=true`);
  });

  it('adds the bearer token for authenticated calls', async () => {
    setToken('stored-jwt');
    fetchMock.mockResolvedValue(jsonResponse(200, { success: true, data: { user: {} } }));

    await api.auth.me();

    const { init } = lastCall();
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer stored-jwt');
  });

  it('omits the authorization header for public calls', async () => {
    setToken('stored-jwt');
    fetchMock.mockResolvedValue(jsonResponse(200, { success: true, data: { items: [] } }));

    await api.products.list();

    expect((lastCall().init.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it('posts the product payload when creating', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { success: true, data: { product: {} } }));

    await api.products.create({ name: 'Aurora Pro' });

    const { url, init } = lastCall();
    expect(url).toBe(`${API_URL}/api/products`);
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ name: 'Aurora Pro' }));
  });

  it('raises a typed ApiError with the server message and field details', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(422, {
        success: false,
        message: 'Invalid checkout payload',
        details: [{ field: 'items', message: 'At least one item is required' }],
      }),
    );

    const error = await api.orders.create({}).catch((thrown) => thrown);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(422);
    expect(error.message).toBe('Invalid checkout payload');
    expect(error.details).toEqual([{ field: 'items', message: 'At least one item is required' }]);
  });

  it('falls back to the HTTP status when the error body is not JSON', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 502,
      headers: { get: () => 'text/html' },
      json: async () => {
        throw new Error('not json');
      },
    });

    const error = await api.auth
      .login({ email: 'a@b.c', password: 'secret' })
      .catch((thrown) => thrown);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(502);
    expect(error.message).toBe('Request failed with status 502');
    expect(error.details).toBeUndefined();
  });

  it('handles a successful response without a body', async () => {
    fetchMock.mockResolvedValue(jsonResponse(204, null));

    await expect(api.products.remove('product-1')).resolves.toBeUndefined();
  });

  it('covers every endpoint helper', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { success: true, data: {} }));

    await api.products.detail('aurora-pro');
    await api.products.update('product-1', { stock: 4 });
    await api.auth.register({ name: 'Nafis', email: 'n@a.com', password: 'secret12' });
    await api.auth.updateProfile({ name: 'Nafis Hasan' });
    await api.orders.mine();
    await api.orders.detail('AUR-1');
    await api.orders.all({ status: 'PENDING', page: 1 });
    await api.orders.updateStatus('AUR-1', 'SHIPPED');
    await api.chat.history('conversation-1');
    await api.chat.send({ conversationId: 'conversation-1', content: 'Hello' });
    await api.admin.stats();
    await api.admin.customers({ search: 'nafis' });

    const calls = fetchMock.mock.calls.map(([url, init]) => ({
      url: String(url),
      method: (init as RequestInit).method || 'GET',
    }));

    expect(calls).toEqual([
      { url: `${API_URL}/api/products/aurora-pro`, method: 'GET' },
      { url: `${API_URL}/api/products/product-1`, method: 'PATCH' },
      { url: `${API_URL}/api/auth/register`, method: 'POST' },
      { url: `${API_URL}/api/auth/me`, method: 'PATCH' },
      { url: `${API_URL}/api/orders`, method: 'GET' },
      { url: `${API_URL}/api/orders/AUR-1`, method: 'GET' },
      { url: `${API_URL}/api/orders/admin/all?status=PENDING&page=1`, method: 'GET' },
      { url: `${API_URL}/api/orders/AUR-1/status`, method: 'PATCH' },
      { url: `${API_URL}/api/chat/conversation-1`, method: 'GET' },
      { url: `${API_URL}/api/chat`, method: 'POST' },
      { url: `${API_URL}/api/admin/stats`, method: 'GET' },
      { url: `${API_URL}/api/admin/customers?search=nafis`, method: 'GET' },
    ]);
  });
});
