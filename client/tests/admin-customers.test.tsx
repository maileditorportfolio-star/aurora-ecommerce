import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminCustomersPage from '@/app/admin/customers/page';
import { adminCustomerFixture } from './fixtures';
import { money } from './money';

const customers = vi.fn();

vi.mock('@/lib/api', () => ({
  api: {
    admin: {
      customers: (...args: unknown[]) => customers(...args),
    },
  },
}));

describe('AdminCustomersPage', () => {
  beforeEach(() => {
    customers.mockReset();
    customers.mockResolvedValue({ customers: [adminCustomerFixture()], pagination: {} });
  });

  it('renders the customer directory', async () => {
    render(<AdminCustomersPage />);

    expect(await screen.findByText('Nafis Hasan')).toBeInTheDocument();
    expect(screen.getByText('nafis@aurora.com')).toBeInTheDocument();
    expect(screen.getByText('+8801800000000')).toBeInTheDocument();
    expect(screen.getByText('NH')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText(money(240000))).toBeInTheDocument();
    expect(screen.getByText(/Feb 2026/)).toBeInTheDocument();
    expect(screen.getByText('1 registered customer(s)')).toBeInTheDocument();
  });

  it('shows a placeholder when the phone number is missing', async () => {
    customers.mockResolvedValue({
      customers: [adminCustomerFixture({ phone: null })],
      pagination: {},
    });
    render(<AdminCustomersPage />);

    expect(await screen.findByText('—')).toBeInTheDocument();
  });

  it('searches the directory through the API', async () => {
    const user = userEvent.setup();
    render(<AdminCustomersPage />);

    await screen.findByText('Nafis Hasan');
    await user.type(screen.getByPlaceholderText(/search name, email or phone/i), 'nafis');

    await waitFor(() =>
      expect(customers).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'nafis' })),
    );
  });

  it('clears the search from the reset button', async () => {
    const user = userEvent.setup();
    render(<AdminCustomersPage />);

    await screen.findByText('Nafis Hasan');
    await user.type(screen.getByPlaceholderText(/search name, email or phone/i), 'nafis');
    await waitFor(() => expect(customers).toHaveBeenLastCalledWith({ search: 'nafis' }));

    await user.click(screen.getByRole('button', { name: 'Reset search' }));

    expect(screen.getByPlaceholderText(/search name, email or phone/i)).toHaveValue('');
    await waitFor(() =>
      expect(customers).toHaveBeenLastCalledWith(expect.objectContaining({ search: undefined })),
    );
  });

  it('shows an empty state when nobody matches', async () => {
    customers.mockResolvedValue({ customers: [], pagination: {} });
    render(<AdminCustomersPage />);

    expect(await screen.findByText('No customers found')).toBeInTheDocument();
    expect(screen.getByText('0 registered customer(s)')).toBeInTheDocument();
  });

  it('shows the empty state when the request fails', async () => {
    customers.mockRejectedValue(new Error('API down'));
    render(<AdminCustomersPage />);

    expect(await screen.findByText('No customers found')).toBeInTheDocument();
  });
});
