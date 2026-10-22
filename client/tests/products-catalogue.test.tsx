import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductsCatalogue } from '@/app/products/products-catalogue';

const listProducts = vi.fn();

vi.mock('@/lib/api', () => ({
  api: {
    products: {
      list: (...args: unknown[]) => listProducts(...args),
    },
  },
}));

const products = [
  {
    id: 'product-1',
    name: 'Aurora Pro 14 Ultrabook',
    slug: 'aurora-pro-14-ultrabook',
    description: 'A 14-inch ultrabook with a 120Hz LTPO display.',
    price: 118000,
    compareAtPrice: null,
    imageUrl: null,
    gallery: [],
    sku: 'AUR-14',
    stock: 10,
    rating: 4.8,
    reviewCount: 120,
    featured: true,
    active: true,
    categoryId: 'category-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'product-2',
    name: 'Aurora Buds Pro',
    slug: 'aurora-buds-pro',
    description: 'Wireless earbuds with active noise cancelling.',
    price: 4500,
    compareAtPrice: null,
    imageUrl: null,
    gallery: [],
    sku: 'AUR-BP',
    stock: 25,
    rating: 4.4,
    reviewCount: 90,
    featured: false,
    active: true,
    categoryId: 'category-2',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const categories = [
  { id: 'category-1', name: 'Laptops', slug: 'laptops' },
  { id: 'category-2', name: 'Audio', slug: 'audio' },
];

describe('ProductsCatalogue', () => {
  beforeEach(() => {
    listProducts.mockReset();
    listProducts.mockResolvedValue({ items: products, categories });
  });

  it('loads the catalogue on mount', async () => {
    render(<ProductsCatalogue />);

    await waitFor(() => expect(listProducts).toHaveBeenCalled());
    expect(listProducts.mock.calls[0][0]).toMatchObject({ sort: 'newest', limit: 24 });
  });

  it('renders the products that were returned', async () => {
    render(<ProductsCatalogue />);

    expect(await screen.findByText('Aurora Pro 14 Ultrabook')).toBeInTheDocument();
    expect(screen.getByText('Aurora Buds Pro')).toBeInTheDocument();
  });

  it('reports how many products are ready to ship', async () => {
    render(<ProductsCatalogue />);

    expect(await screen.findByText(/2 products ready to ship/)).toBeInTheDocument();
  });

  it('lists the categories in the sidebar', async () => {
    render(<ProductsCatalogue />);

    expect(await screen.findByRole('button', { name: 'Laptops' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Audio' })).toBeInTheDocument();
  });

  it('filters the catalogue by category', async () => {
    const user = userEvent.setup();
    render(<ProductsCatalogue />);

    await user.click(await screen.findByRole('button', { name: 'Laptops' }));

    await waitFor(() =>
      expect(listProducts).toHaveBeenLastCalledWith(
        expect.objectContaining({ category: 'laptops' }),
      ),
    );
  });

  it('passes the search term to the API', async () => {
    const user = userEvent.setup();
    render(<ProductsCatalogue />);

    await user.type(screen.getByPlaceholderText(/search products/i), 'aurora');

    await waitFor(() =>
      expect(listProducts).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'aurora' })),
    );
  });

  it('passes the selected sort order to the API', async () => {
    const user = userEvent.setup();
    render(<ProductsCatalogue />);

    await user.selectOptions(await screen.findByRole('combobox'), 'price-asc');

    await waitFor(() =>
      expect(listProducts).toHaveBeenLastCalledWith(expect.objectContaining({ sort: 'price-asc' })),
    );
  });

  it('shows an empty state when nothing matches the filters', async () => {
    listProducts.mockResolvedValue({ items: [], categories });

    render(<ProductsCatalogue />);

    expect(await screen.findByText('No products matched your filters.')).toBeInTheDocument();
  });

  it('resets every filter from the empty state', async () => {
    listProducts.mockResolvedValue({ items: [], categories });
    const user = userEvent.setup();
    render(<ProductsCatalogue />);

    await user.click(await screen.findByRole('button', { name: 'Reset everything' }));

    await waitFor(() =>
      expect(listProducts).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: undefined, category: undefined }),
      ),
    );
  });

  it('keeps the catalogue usable when the API fails', async () => {
    listProducts.mockRejectedValue(new Error('Network down'));

    render(<ProductsCatalogue />);

    await waitFor(() => expect(listProducts).toHaveBeenCalled());
    expect(screen.getByText('The catalogue')).toBeInTheDocument();
  });
});
