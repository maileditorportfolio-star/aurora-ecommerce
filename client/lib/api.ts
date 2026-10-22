import type { ChatMessage, Order, Pagination, Product, ProductListResponse, User } from '@/types';

export interface AdminStats {
  totals: {
    revenue: number;
    pipeline: number;
    orders: number;
    products: number;
    customers: number;
    categories: number;
    averageOrder: number;
  };
  revenueByMonth: Array<{ month: string; revenue: number; orders: number }>;
  statusCounts: Array<{ status: string; count: number }>;
  topProducts: Array<{ name: string; units: number }>;
  lowStock: Array<{ id: string; name: string; stock: number }>;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  orderCount: number;
  lifetimeValue: number;
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || API_URL;

export const TOKEN_KEY = 'aurora_token';

export class ApiError extends Error {
  status: number;
  details?: Array<{ field: string; message: string }>;

  constructor(
    status: number,
    message: string,
    details?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string | null): void => {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
};

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  auth?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = false, headers, ...rest } = options;

  const token = auth ? getToken() : null;

  const response = await fetch(`${API_URL}/api${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.message || `Request failed with status ${response.status}`,
      payload?.details,
    );
  }

  return payload?.data as T;
}

const query = (params: Record<string, string | number | boolean | undefined | null>): string => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  const encoded = search.toString();
  return encoded ? `?${encoded}` : '';
};

export const api = {
  products: {
    list: (params: Record<string, string | number | boolean | undefined | null> = {}) =>
      request<ProductListResponse>(`/products${query(params)}`),
    detail: (slug: string) =>
      request<{ product: Product; related: Product[] }>(`/products/${slug}`),
    create: (payload: Partial<Product>) =>
      request<{ product: Product }>('/products', { method: 'POST', body: payload, auth: true }),
    update: (id: string, payload: Partial<Product>) =>
      request<{ product: Product }>(`/products/${id}`, {
        method: 'PATCH',
        body: payload,
        auth: true,
      }),
    remove: (id: string) =>
      request<{ product: Product }>(`/products/${id}`, { method: 'DELETE', auth: true }),
  },
  auth: {
    register: (payload: { name: string; email: string; password: string; phone?: string }) =>
      request<{ user: User; token: string }>('/auth/register', { method: 'POST', body: payload }),
    login: (payload: { email: string; password: string }) =>
      request<{ user: User; token: string }>('/auth/login', { method: 'POST', body: payload }),
    me: () => request<{ user: User }>('/auth/me', { auth: true }),
    updateProfile: (payload: Partial<User>) =>
      request<{ user: User }>('/auth/me', { method: 'PATCH', body: payload, auth: true }),
  },
  orders: {
    create: (payload: unknown) =>
      request<{ order: Order }>('/orders', { method: 'POST', body: payload, auth: true }),
    mine: () => request<{ orders: Order[] }>('/orders', { auth: true }),
    detail: (orderNumber: string) =>
      request<{ order: Order }>(`/orders/${orderNumber}`, { auth: true }),
    all: (params: Record<string, string | number | undefined> = {}) =>
      request<{ orders: Order[]; pagination: Pagination }>(`/orders/admin/all${query(params)}`, {
        auth: true,
      }),
    updateStatus: (orderNumber: string, status: string) =>
      request<{ order: Order }>(`/orders/${orderNumber}/status`, {
        method: 'PATCH',
        body: { status },
        auth: true,
      }),
  },
  chat: {
    history: (conversationId: string) =>
      request<{ messages: ChatMessage[] }>(`/chat/${conversationId}`),
    send: (payload: { conversationId: string; content: string }) =>
      request<{ message: ChatMessage }>('/chat', { method: 'POST', body: payload, auth: true }),
  },
  admin: {
    stats: () => request<AdminStats>('/admin/stats', { auth: true }),
    customers: (params: Record<string, string | number | undefined> = {}) =>
      request<{ customers: AdminCustomer[]; pagination: Pagination }>(
        `/admin/customers${query(params)}`,
        { auth: true },
      ),
  },
};

export default api;
