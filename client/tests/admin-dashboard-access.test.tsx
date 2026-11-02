import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminDashboardPage from '@/app/admin/page';
import { useAuthStore } from '@/store/auth';
import { userFixture } from './fixtures';

const stats = vi.fn();

vi.mock('@/lib/api', () => ({
  api: {
    admin: {
      stats: (...args: unknown[]) => stats(...args),
    },
  },
}));

describe('AdminDashboardPage access', () => {
  beforeEach(() => {
    stats.mockReset();
    stats.mockResolvedValue(null);
  });

  it('shows the access state when analytics.read is missing', () => {
    useAuthStore.setState({
      user: {
        ...userFixture,
        role: 'ADMIN',
        permissions: ['products.write', 'orders.read'],
      },
      token: 'jwt-token',
      isLoading: false,
    });

    render(<AdminDashboardPage />);

    expect(screen.getByText('Dashboard access required')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open products' })).toHaveAttribute(
      'href',
      '/admin/products',
    );
    expect(screen.getByRole('link', { name: 'Open orders' })).toHaveAttribute(
      'href',
      '/admin/orders',
    );
    expect(stats).not.toHaveBeenCalled();
  });
});
