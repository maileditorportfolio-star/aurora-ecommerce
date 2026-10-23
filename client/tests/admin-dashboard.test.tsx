import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminDashboardPage from '@/app/admin/page';
import AdminAnalyticsPage from '@/app/admin/analytics/page';
import { adminStatsFixture } from './fixtures';
import { money } from './money';

const stats = vi.fn();

vi.mock('@/lib/api', () => ({
  api: {
    admin: {
      stats: (...args: unknown[]) => stats(...args),
    },
  },
}));

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    stats.mockReset();
  });

  it('summarises revenue, orders, products and customers', async () => {
    stats.mockResolvedValue(adminStatsFixture());
    render(<AdminDashboardPage />);

    expect(await screen.findByText(money(420000))).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText(/^Pipeline value/)).toBeInTheDocument();
    expect(screen.getByText(/^avg\s/)).toBeInTheDocument();
  });

  it('lists products that are running low on stock', async () => {
    stats.mockResolvedValue(adminStatsFixture());
    render(<AdminDashboardPage />);

    expect(await screen.findByText('Aurora Buds Pro')).toBeInTheDocument();
    expect(screen.getByText('3 left')).toBeInTheDocument();
    expect(stats).toHaveBeenCalledTimes(1);
  });

  it('tells the operator the catalogue is healthy when nothing is low', async () => {
    stats.mockResolvedValue(adminStatsFixture({ lowStock: [] }));
    render(<AdminDashboardPage />);

    expect(await screen.findByText('Everything is comfortably in stock.')).toBeInTheDocument();
  });

  it('keeps the dashboard mounted when the stats request fails', async () => {
    stats.mockRejectedValue(new Error('API down'));
    render(<AdminDashboardPage />);

    expect(await screen.findByText('Everything is comfortably in stock.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });
});

describe('AdminAnalyticsPage', () => {
  beforeEach(() => {
    stats.mockReset();
  });

  it('renders the monthly breakdown table', async () => {
    stats.mockResolvedValue(adminStatsFixture());
    render(<AdminAnalyticsPage />);

    expect(await screen.findByRole('cell', { name: 'May' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Jun' })).toBeInTheDocument();
    expect(screen.getAllByText(money(60000)).length).toBeGreaterThan(0);
    expect(screen.getByText('Six-month performance, broken down.')).toBeInTheDocument();
  });

  it('renders an empty table when the stats request fails', async () => {
    stats.mockRejectedValue(new Error('API down'));
    render(<AdminAnalyticsPage />);

    expect(await screen.findByRole('heading', { name: 'Analytics' })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: 'May' })).not.toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Revenue' })).toBeInTheDocument();
  });
});
