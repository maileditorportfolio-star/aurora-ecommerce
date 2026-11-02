import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductDetailPage from '@/app/products/[slug]/page';
import { useCartStore } from '@/store/cart';
import { productFixture } from './fixtures';
import { money } from './money';

const detail = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'aurora-pro-14-ultrabook' }),
}));

vi.mock('@/lib/api', () => ({
  api: {
    products: {
      detail: (...args: unknown[]) => detail(...args),
    },
  },
}));

const respond = (product = productFixture(), related = [productFixture({ id: 'related-1' })]) =>
  detail.mockResolvedValue({ product, related });

describe('ProductDetailPage', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false });
    detail.mockReset();
  });

  it('loads the product and renders its details', async () => {
    respond();
    render(<ProductDetailPage />);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Aurora Pro 14 Ultrabook' }),
    ).toBeInTheDocument();
    expect(detail).toHaveBeenCalledWith('aurora-pro-14-ultrabook');
    expect(screen.getAllByText('Laptops').length).toBeGreaterThan(0);
    expect(screen.getByText('18 in stock')).toBeInTheDocument();
    expect(screen.getAllByText(money(118000)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(money(135000)).length).toBeGreaterThan(0);
    expect(screen.getByText('-13% off')).toBeInTheDocument();
    expect(screen.getByText('12-month brand warranty')).toBeInTheDocument();
  });

  it('shows the related products section', async () => {
    respond();
    render(<ProductDetailPage />);

    expect(await screen.findByText('You may also like')).toBeInTheDocument();
  });

  it('hides the related section when there are no related products', async () => {
    respond(productFixture(), []);
    render(<ProductDetailPage />);

    await screen.findByRole('heading', { name: 'Aurora Pro 14 Ultrabook' });
    expect(screen.queryByText('You may also like')).not.toBeInTheDocument();
  });

  it('adds the selected quantity to the cart', async () => {
    respond();
    const user = userEvent.setup();
    render(<ProductDetailPage />);

    await user.click(await screen.findByRole('button', { name: 'Increase quantity' }));
    await user.click(screen.getByRole('button', { name: 'Increase quantity' }));
    expect(screen.getByText('3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add to cart' }));

    expect(useCartStore.getState().items[0].quantity).toBe(3);
    expect(screen.getByRole('button', { name: 'Added to cart' })).toBeInTheDocument();
  });

  it('never drops the quantity below one', async () => {
    respond();
    const user = userEvent.setup();
    render(<ProductDetailPage />);

    await user.click(await screen.findByRole('button', { name: 'Decrease quantity' }));

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('marks a sold-out product and disables the cart button', async () => {
    respond(productFixture({ stock: 0, featured: false }));
    render(<ProductDetailPage />);

    expect(await screen.findByText('Out of stock')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sold out' })).toBeDisabled();
  });

  it('shows a not-found state when the product cannot be loaded', async () => {
    detail.mockRejectedValue(new Error('404'));
    render(<ProductDetailPage />);

    expect(await screen.findByText('Product not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to catalogue' })).toHaveAttribute(
      'href',
      '/products',
    );
  });

  it('shows the loading skeleton before the product arrives', () => {
    detail.mockReturnValue(new Promise(() => undefined));
    const { container } = render(<ProductDetailPage />);

    expect(container.querySelectorAll('.skeleton')).toHaveLength(5);
  });
});
