import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminOrdersPage from '@/app/admin/orders/page';
import { orderFixture } from './fixtures';
import { money } from './money';

const all = vi.fn();
const updateStatus = vi.fn();

vi.mock('@/lib/api', () => ({
  api: {
    orders: {
      all: (...args: unknown[]) => all(...args),
      updateStatus: (...args: unknown[]) => updateStatus(...args),
    },
  },
}));

describe('AdminOrdersPage', () => {
  beforeEach(() => {
    all.mockReset();
    updateStatus.mockReset();
    all.mockResolvedValue({ orders: [orderFixture()], pagination: {} });
  });

  it('renders the orders returned by the API', async () => {
    render(<AdminOrdersPage />);

    expect(await screen.findByText('AUR-TEST-0001')).toBeInTheDocument();
    expect(screen.getAllByText('SHIPPED').length).toBeGreaterThan(0);
    expect(screen.getByText(money(118000))).toBeInTheDocument();
    expect(screen.getByText('Aurora Pro 14 Ultrabook × 1')).toBeInTheDocument();
    expect(screen.getByText('1 order(s) in view')).toBeInTheDocument();
  });

  it('filters by status and toggles the filter off again', async () => {
    const user = userEvent.setup();
    render(<AdminOrdersPage />);

    await screen.findByText('AUR-TEST-0001');
    await user.click(screen.getByRole('button', { name: 'DELIVERED' }));

    await waitFor(() =>
      expect(all).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: undefined, status: 'DELIVERED' }),
      ),
    );

    await user.click(screen.getByRole('button', { name: 'DELIVERED' }));

    await waitFor(() =>
      expect(all).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: undefined, status: undefined }),
      ),
    );
  });

  it('passes the search term to the API', async () => {
    const user = userEvent.setup();
    render(<AdminOrdersPage />);

    await screen.findByText('AUR-TEST-0001');
    await user.type(screen.getByPlaceholderText(/search order number/i), 'AUR-TEST');

    await waitFor(() =>
      expect(all).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'AUR-TEST' })),
    );
  });

  it('updates the status of an order', async () => {
    updateStatus.mockResolvedValue({ order: orderFixture({ status: 'DELIVERED' }) });
    const user = userEvent.setup();
    render(<AdminOrdersPage />);

    await screen.findByText('AUR-TEST-0001');
    await user.selectOptions(screen.getByRole('combobox'), 'DELIVERED');

    expect(updateStatus).toHaveBeenCalledWith('AUR-TEST-0001', 'DELIVERED');
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue('DELIVERED'));
  });

  it('keeps the previous status when the update is rejected', async () => {
    updateStatus.mockRejectedValue(new Error('not allowed'));
    const user = userEvent.setup();
    render(<AdminOrdersPage />);

    await screen.findByText('AUR-TEST-0001');
    await user.selectOptions(screen.getByRole('combobox'), 'DELIVERED');

    await waitFor(() => expect(updateStatus).toHaveBeenCalled());
    expect(screen.getByRole('combobox')).toHaveValue('SHIPPED');
  });

  it('reloads the list when refresh is pressed', async () => {
    const user = userEvent.setup();
    render(<AdminOrdersPage />);

    await screen.findByText('AUR-TEST-0001');
    await user.click(screen.getByRole('button', { name: 'Refresh' }));

    await waitFor(() => expect(all).toHaveBeenCalledTimes(2));
  });

  it('shows an empty state when no orders match', async () => {
    all.mockResolvedValue({ orders: [], pagination: {} });
    render(<AdminOrdersPage />);

    expect(await screen.findByText('No orders found')).toBeInTheDocument();
    expect(screen.getByText('Try a different filter or search term.')).toBeInTheDocument();
  });

  it('shows the empty state when the request fails', async () => {
    all.mockRejectedValue(new Error('API down'));
    render(<AdminOrdersPage />);

    expect(await screen.findByText('No orders found')).toBeInTheDocument();
  });
});
