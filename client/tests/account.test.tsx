import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AccountPage from '@/app/account/page';
import { useAuthStore } from '@/store/auth';
import { orderFixture, userFixture } from './fixtures';
import { money } from './money';

const push = vi.fn();
const replace = vi.fn();
const mine = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, refresh: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock('@/lib/api', () => ({
  api: {
    orders: {
      mine: (...args: unknown[]) => mine(...args),
    },
  },
  setToken: vi.fn(),
}));

describe('AccountPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: userFixture, token: 'jwt-token', isLoading: false, error: null });
    push.mockReset();
    replace.mockReset();
    mine.mockReset();
  });

  it('greets the customer with their first name and email', async () => {
    mine.mockResolvedValue({ orders: [] });
    render(<AccountPage />);

    expect(await screen.findByRole('heading', { name: 'Hello, Nafis' })).toBeInTheDocument();
    expect(screen.getByText('nafis@aurora.com')).toBeInTheDocument();
  });

  it('shows the empty state when the customer has no orders', async () => {
    mine.mockResolvedValue({ orders: [] });
    render(<AccountPage />);

    expect(await screen.findByText('No orders yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse products' })).toHaveAttribute(
      'href',
      '/products',
    );
  });

  it('renders the order history with status and timeline', async () => {
    mine.mockResolvedValue({ orders: [orderFixture()] });
    render(<AccountPage />);

    expect(await screen.findByText('AUR-TEST-0001')).toBeInTheDocument();
    expect(screen.getByText('SHIPPED')).toBeInTheDocument();
    expect(screen.getAllByText(money(118000)).length).toBeGreaterThan(0);
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  it('hides the timeline for cancelled orders', async () => {
    mine.mockResolvedValue({ orders: [orderFixture({ status: 'CANCELLED' })] });
    render(<AccountPage />);

    await screen.findByText('AUR-TEST-0001');
    expect(screen.getByText('CANCELLED')).toBeInTheDocument();
    expect(screen.queryByText('Confirmed')).not.toBeInTheDocument();
  });

  it('falls back to the empty state when orders cannot be loaded', async () => {
    mine.mockRejectedValue(new Error('network down'));
    render(<AccountPage />);

    expect(await screen.findByText('No orders yet')).toBeInTheDocument();
  });

  it('signs the customer out and returns home', async () => {
    mine.mockResolvedValue({ orders: [] });
    const user = userEvent.setup();
    render(<AccountPage />);

    await screen.findByText('No orders yet');
    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(useAuthStore.getState().user).toBeNull();
    expect(push).toHaveBeenCalledWith('/');
  });

  it('redirects guests to the login page once loading settles', async () => {
    useAuthStore.setState({ user: null, token: null });
    mine.mockResolvedValue({ orders: [] });
    render(<AccountPage />);

    await screen.findByText('No orders yet');

    expect(replace).toHaveBeenCalledWith('/login');
  });

  it('links to the admin console', async () => {
    mine.mockResolvedValue({ orders: [] });
    render(<AccountPage />);

    expect(await screen.findByRole('link', { name: 'Open it here' })).toHaveAttribute(
      'href',
      '/admin',
    );
  });
});
