import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  OrdersByStatusChart,
  RevenueTrendChart,
  TopProductsChart,
} from '@/components/admin/dashboard-charts';
import { adminStatsFixture } from './fixtures';

const stats = adminStatsFixture();

describe('dashboard charts', () => {
  it('renders the revenue trend', () => {
    const { container } = render(<RevenueTrendChart data={stats.revenueByMonth} />);

    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('renders the order status breakdown', () => {
    const { container } = render(<OrdersByStatusChart data={stats.statusCounts} />);

    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('renders the top products bars', () => {
    const { container } = render(<TopProductsChart data={stats.topProducts} />);

    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('renders every chart with empty data', () => {
    const { container } = render(
      <>
        <RevenueTrendChart data={[]} />
        <OrdersByStatusChart data={[]} />
        <TopProductsChart data={[]} />
      </>,
    );

    expect(container.querySelectorAll('.recharts-responsive-container')).toHaveLength(3);
  });
});
