import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';
import RegisterPage from '@/app/register/page';
import { useAuthStore } from '@/store/auth';

const push = vi.fn();
const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, refresh: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
}));

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

describe('LoginPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isLoading: false, error: null });
    push.mockReset();
    replace.mockReset();
  });

  it('renders the form and the demo credentials', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText(/customer@aurora\.com \/ aurora123/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
      'href',
      '/register',
    );
  });

  it('submits the credentials and redirects home', async () => {
    const { api } = await import('@/lib/api');
    vi.mocked(api.auth.login).mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Nafis Hasan',
        email: 'nafis@aurora.com',
        role: 'CUSTOMER',
      },
      token: 'jwt-token',
    });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText('Email'), 'nafis@aurora.com');
    await user.type(screen.getByLabelText('Password'), 'secret12');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(api.auth.login).toHaveBeenCalledWith({
      email: 'nafis@aurora.com',
      password: 'secret12',
    });
    expect(push).toHaveBeenCalledWith('/');
  });

  it('shows the store error and clears it when typing again', async () => {
    const { api } = await import('@/lib/api');
    vi.mocked(api.auth.login).mockRejectedValue(new Error('Invalid email or password'));
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText('Email'), 'nafis@aurora.com');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Email'), '!');

    expect(screen.queryByText('Invalid email or password')).not.toBeInTheDocument();
  });
});

describe('RegisterPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isLoading: false, error: null });
    push.mockReset();
  });

  it('renders every required field', () => {
    render(<RegisterPage />);

    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone (optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(
      screen.getByText('Use 8+ characters with a mix of letters and numbers.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
  });

  it('creates the account and redirects home', async () => {
    const { api } = await import('@/lib/api');
    vi.mocked(api.auth.register).mockResolvedValue({
      user: {
        id: 'user-2',
        name: 'Nafis Hasan',
        email: 'nafis@aurora.com',
        role: 'CUSTOMER',
      },
      token: 'jwt-token',
    });
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByLabelText('Full name'), 'Nafis Hasan');
    await user.type(screen.getByLabelText('Email'), 'nafis@aurora.com');
    await user.type(screen.getByLabelText('Phone (optional)'), '+8801800000000');
    await user.type(screen.getByLabelText('Password'), 'secret12');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(api.auth.register).toHaveBeenCalledWith({
      name: 'Nafis Hasan',
      email: 'nafis@aurora.com',
      phone: '+8801800000000',
      password: 'secret12',
    });
    expect(push).toHaveBeenCalledWith('/');
  });

  it('keeps the customer on the page when registration fails', async () => {
    const { api } = await import('@/lib/api');
    vi.mocked(api.auth.register).mockRejectedValue(new Error('An account with this email exists'));
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByLabelText('Full name'), 'Nafis Hasan');
    await user.type(screen.getByLabelText('Email'), 'nafis@aurora.com');
    await user.type(screen.getByLabelText('Password'), 'secret12');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('An account with this email exists')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
