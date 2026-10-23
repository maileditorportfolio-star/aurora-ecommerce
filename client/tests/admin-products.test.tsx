import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminProductsPage from '@/app/admin/products/page';
import { productFixture } from './fixtures';
import { money } from './money';

const list = vi.fn();
const create = vi.fn();
const update = vi.fn();

vi.mock('@/lib/api', () => ({
  api: {
    products: {
      list: (...args: unknown[]) => list(...args),
      create: (...args: unknown[]) => create(...args),
      update: (...args: unknown[]) => update(...args),
    },
  },
}));

describe('AdminProductsPage', () => {
  beforeEach(() => {
    list.mockReset();
    create.mockReset();
    update.mockReset();
    list.mockResolvedValue({ items: [productFixture()], categories: [] });
    create.mockResolvedValue({ product: productFixture() });
    update.mockResolvedValue({ product: productFixture() });
  });

  it('renders the catalogue with stock and price', async () => {
    render(<AdminProductsPage />);

    expect(await screen.findByText('Aurora Pro 14 Ultrabook')).toBeInTheDocument();
    expect(screen.getByText(money(118000))).toBeInTheDocument();
    expect(screen.getByText('18 in stock')).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();
    expect(screen.getByText('Laptops')).toBeInTheDocument();
    expect(screen.getByText('1 products')).toBeInTheDocument();
  });

  it('shows an empty state with a call to action', async () => {
    list.mockResolvedValue({ items: [] });
    render(<AdminProductsPage />);

    expect(await screen.findByText('No products yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add the first product' })).toBeInTheDocument();
  });

  it('falls back to the empty state when the request fails', async () => {
    list.mockRejectedValue(new Error('API down'));
    render(<AdminProductsPage />);

    expect(await screen.findByText('No products yet')).toBeInTheDocument();
  });

  it('searches the catalogue through the API', async () => {
    const user = userEvent.setup();
    render(<AdminProductsPage />);

    await screen.findByText('Aurora Pro 14 Ultrabook');
    await user.type(screen.getByPlaceholderText(/search products/i), 'buds');

    await waitFor(() =>
      expect(list).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'buds' })),
    );
  });

  it('creates a product from the modal form', async () => {
    const user = userEvent.setup();
    render(<AdminProductsPage />);

    await screen.findByText('Aurora Pro 14 Ultrabook');
    await user.click(screen.getByRole('button', { name: 'New product' }));

    expect(screen.getByRole('heading', { name: 'New product' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Name'), 'Aurora Watch');
    await user.type(screen.getByLabelText('Description'), 'A titanium smartwatch.');
    await user.type(screen.getByLabelText('Price'), '5200');
    await user.click(screen.getByRole('button', { name: 'Create product' }));

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Aurora Watch',
          description: 'A titanium smartwatch.',
          price: 5200,
          stock: 0,
          featured: false,
          active: true,
        }),
      ),
    );
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'New product' })).not.toBeInTheDocument(),
    );
  });

  it('surfaces the API error and keeps the modal open', async () => {
    create.mockRejectedValue(new Error('Name is already taken'));
    const user = userEvent.setup();
    render(<AdminProductsPage />);

    await screen.findByText('Aurora Pro 14 Ultrabook');
    await user.click(screen.getByRole('button', { name: 'New product' }));
    await user.type(screen.getByLabelText('Name'), 'Aurora Watch');
    await user.type(screen.getByLabelText('Description'), 'A titanium smartwatch.');
    await user.type(screen.getByLabelText('Price'), '5200');
    await user.click(screen.getByRole('button', { name: 'Create product' }));

    expect(await screen.findByText('Name is already taken')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'New product' })).toBeInTheDocument();
  });

  it('prefills the form when editing a product', async () => {
    const user = userEvent.setup();
    render(<AdminProductsPage />);

    await screen.findByText('Aurora Pro 14 Ultrabook');
    await user.click(screen.getByRole('button', { name: 'Edit' }));

    expect(screen.getByRole('heading', { name: 'Edit product' })).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Aurora Pro 14 Ultrabook');
    expect(screen.getByLabelText('Price')).toHaveValue(118000);
    expect(screen.getByLabelText('Stock')).toHaveValue(18);

    await user.clear(screen.getByLabelText('Price'));
    await user.type(screen.getByLabelText('Price'), '99000');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        'product-1',
        expect.objectContaining({ price: 99000, stock: 18 }),
      ),
    );
  });

  it('closes the modal without saving', async () => {
    const user = userEvent.setup();
    render(<AdminProductsPage />);

    await screen.findByText('Aurora Pro 14 Ultrabook');
    await user.click(screen.getByRole('button', { name: 'New product' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'New product' })).not.toBeInTheDocument(),
    );
    expect(create).not.toHaveBeenCalled();
  });
});
