import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from '@/components/product/product-card';
import { useCartStore } from '@/store/cart';
import { productFixture } from './fixtures';
import { money } from './money';

describe('ProductCard', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false });
  });

  it('shows the product name, price, rating and category', () => {
    render(<ProductCard product={productFixture()} />);

    expect(screen.getByRole('heading', { name: 'Aurora Pro 14 Ultrabook' })).toBeInTheDocument();
    expect(screen.getByText('Laptops')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('(124 reviews)')).toBeInTheDocument();
    expect(screen.getByText(money(118000))).toBeInTheDocument();
    expect(screen.getByText(money(135000))).toBeInTheDocument();
  });

  it('highlights featured, discounted and sold-out products', () => {
    render(<ProductCard product={productFixture({ stock: 0 })} />);

    expect(screen.getByText('Featured')).toBeInTheDocument();
    expect(screen.getByText('-13%')).toBeInTheDocument();
    expect(screen.getAllByText('Sold out').length).toBeGreaterThan(0);
  });

  it('adds the product to the cart', async () => {
    const user = userEvent.setup();
    render(<ProductCard product={productFixture()} />);

    await user.click(screen.getByRole('button', { name: 'Add Aurora Pro 14 Ultrabook to cart' }));

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].productId).toBe('product-1');
  });

  it('disables the add button when the product is sold out', () => {
    render(<ProductCard product={productFixture({ stock: 0 })} />);

    const button = screen.getByRole('button', { name: 'Add Aurora Pro 14 Ultrabook to cart' });
    expect(button).toBeDisabled();
  });

  it('omits badges and compare-at price when they do not apply', () => {
    render(
      <ProductCard
        product={productFixture({
          featured: false,
          compareAtPrice: null,
          category: null,
          imageUrl: null,
        })}
      />,
    );

    expect(screen.queryByText('Featured')).not.toBeInTheDocument();
    expect(screen.queryByText(/-\d+%/)).not.toBeInTheDocument();
    expect(screen.queryByText('Laptops')).not.toBeInTheDocument();
    expect(screen.queryByText(money(135000))).not.toBeInTheDocument();
  });

  it('links to the product detail page', () => {
    render(<ProductCard product={productFixture()} />);

    const links = screen.getAllByRole('link');
    expect(
      links.every((link) => link.getAttribute('href') === '/products/aurora-pro-14-ultrabook'),
    ).toBe(true);
  });
});
