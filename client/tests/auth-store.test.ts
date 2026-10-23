import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '@/store/auth';
import { api, setToken } from '@/lib/api';
import type { User } from '@/types';

vi.mock('@/lib/api', () => ({
  api: {
    auth: {
      login: vi.fn(),
      register: vi.fn(),
      me: vi.fn(),
    },
  },
  setToken: vi.fn(),
}));

const user: User = {
  id: 'user-1',
  name: 'Nafis Hasan',
  email: 'nafis@aurora.com',
  phone: '+8801800000000',
  role: 'CUSTOMER',
  avatarUrl: null,
};

describe('auth store', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isLoading: false, error: null });
    vi.mocked(api.auth.login).mockReset();
    vi.mocked(api.auth.register).mockReset();
    vi.mocked(api.auth.me).mockReset();
    vi.mocked(setToken).mockReset();
  });

  it('signs in and keeps the API token in sync', async () => {
    vi.mocked(api.auth.login).mockResolvedValue({ user, token: 'jwt-token' });

    await useAuthStore.getState().login('nafis@aurora.com', 'secret12');

    expect(useAuthStore.getState()).toMatchObject({
      user,
      token: 'jwt-token',
      isLoading: false,
      error: null,
    });
    expect(setToken).toHaveBeenCalledWith('jwt-token');
  });

  it('surfaces a sign-in failure and rethrows it', async () => {
    vi.mocked(api.auth.login).mockRejectedValue(new Error('Invalid email or password'));

    await expect(useAuthStore.getState().login('nafis@aurora.com', 'wrong')).rejects.toThrow(
      'Invalid email or password',
    );

    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      isLoading: false,
      error: 'Invalid email or password',
    });
  });

  it('registers an account and stores the session', async () => {
    vi.mocked(api.auth.register).mockResolvedValue({ user, token: 'new-token' });

    await useAuthStore.getState().register({
      name: 'Nafis Hasan',
      email: 'nafis@aurora.com',
      password: 'secret12',
    });

    expect(useAuthStore.getState().token).toBe('new-token');
    expect(setToken).toHaveBeenCalledWith('new-token');
  });

  it('uses a readable fallback when registration fails unexpectedly', async () => {
    vi.mocked(api.auth.register).mockRejectedValue('network down');

    await expect(
      useAuthStore.getState().register({
        name: 'Nafis Hasan',
        email: 'nafis@aurora.com',
        password: 'secret12',
      }),
    ).rejects.toBe('network down');

    expect(useAuthStore.getState().error).toBe('Unable to create account');
  });

  it('clears the session on logout', () => {
    useAuthStore.setState({ user, token: 'jwt-token', error: 'stale' });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState()).toMatchObject({ user: null, token: null, error: null });
    expect(setToken).toHaveBeenCalledWith(null);
  });

  it('hydrates the profile from the API', async () => {
    vi.mocked(api.auth.me).mockResolvedValue({ user });

    await useAuthStore.getState().hydrate();

    expect(useAuthStore.getState()).toMatchObject({ user, isLoading: false });
  });

  it('drops a stale session when hydration fails', async () => {
    useAuthStore.setState({ user, token: 'expired' });
    vi.mocked(api.auth.me).mockRejectedValue(new Error('Session expired'));

    await useAuthStore.getState().hydrate();

    expect(useAuthStore.getState()).toMatchObject({ user: null, token: null, isLoading: false });
  });

  it('exposes setters for the user and the error banner', () => {
    useAuthStore.getState().setUser(user);
    expect(useAuthStore.getState().user).toEqual(user);

    useAuthStore.setState({ error: 'boom' });
    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });
});
