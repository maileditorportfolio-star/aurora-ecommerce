import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';
import { useCartStore } from '@/store/cart';
import { productFixture } from './fixtures';

const list = vi.fn();

vi.mock('@/lib/api', () => ({
  api: {
    products: {
      list: (...args: unknown[]) => list(...args),
    },
  },
}));

describe('HomePage', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false });
    list.mockReset();
  });

  it('renders the hero and the feature highlights', async () => {
    list.mockResolvedValue({ items: [] });
    render(<HomePage />);

    expect(screen.getByRole('heading', { name: /Tech that feels/ })).toBeInTheDocument();
    expect(screen.getByText('Shopping should feel effortless')).toBeInTheDocument();
    expect(screen.getByText('Real stock, real fast')).toBeInTheDocument();
    expect(screen.getByText('Transparent pricing')).toBeInTheDocument();
    expect(screen.getByText('Support that answers')).toBeInTheDocument();
  });

  it('requests the featured products and renders the grid', async () => {
    list.mockResolvedValue({ items: [productFixture()] });
    render(<HomePage />);

    expect(
      await screen.findByRole('heading', { name: 'Aurora Pro 14 Ultrabook' }),
    ).toBeInTheDocument();
    expect(list).toHaveBeenCalledWith({ featured: true, limit: 6 });
    expect(screen.getByText('Featured drops')).toBeInTheDocument();
  });

  it('invites the owner to seed the catalogue when it is empty', async () => {
    list.mockResolvedValue({ items: [] });
    render(<HomePage />);

    expect(
      await screen.findByText(
        'No products yet. Seed the database to see the catalogue come alive.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open admin' })).toHaveAttribute('href', '/admin');
  });

  it('degrades to the empty state when the catalogue request fails', async () => {
    list.mockRejectedValue(new Error('API down'));
    render(<HomePage />);

    expect(
      await screen.findByText(
        'No products yet. Seed the database to see the catalogue come alive.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the closing call to action', async () => {
    list.mockResolvedValue({ items: [] });
    render(<HomePage />);

    expect(screen.getByText('Ready to upgrade your setup?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Start shopping/ })).toHaveAttribute(
      'href',
      '/products',
    );
  });

  it('shows skeletons while the catalogue is loading', () => {
    list.mockReturnValue(new Promise(() => undefined));
    const { container } = render(<HomePage />);

    expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(0);
  });
});
