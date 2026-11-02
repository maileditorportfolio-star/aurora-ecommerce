import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartDrawer from '@/components/layout/cart-drawer';
import { useCartStore } from '@/store/cart';
import { cartItemFixture } from './fixtures';
import { money } from './money';

const openWith = (items: ReturnType<typeof cartItemFixture>[]) => {
  useCartStore.setState({ items, isOpen: true });
};

describe('CartDrawer', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false });
  });

  it('renders nothing while the drawer is closed', () => {
    render(<CartDrawer />);

    expect(screen.queryByText('Your cart')).not.toBeInTheDocument();
  });

  it('shows the empty state with a link back to the catalogue', () => {
    openWith([]);
    render(<CartDrawer />);

    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse products' })).toHaveAttribute(
      'href',
      '/products',
    );
  });

  it('lists the lines, quantities and totals', () => {
    openWith([
      { ...cartItemFixture(), quantity: 2 },
      {
        ...cartItemFixture({ id: 'product-2', name: 'Aurora Buds', slug: 'buds', price: 500 }),
        quantity: 1,
      },
    ]);
    render(<CartDrawer />);

    expect(screen.getByRole('heading', { name: 'Your cart' })).toBeInTheDocument();
    expect(screen.getByText('Aurora Pro 14 Ultrabook')).toBeInTheDocument();
    expect(screen.getByText('Aurora Buds')).toBeInTheDocument();
    expect(screen.getByText(money(118000 * 2))).toBeInTheDocument();
    expect(screen.getAllByText(money(118000 * 2 + 500)).length).toBeGreaterThan(0);
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('charges delivery below the free-shipping threshold', () => {
    openWith([{ ...cartItemFixture({ price: 100 }), quantity: 1 }]);
    render(<CartDrawer />);

    expect(screen.getByText(money(60))).toBeInTheDocument();
    expect(screen.getByText(money(160))).toBeInTheDocument();
  });

  it('increases and decreases the quantity through the stepper', async () => {
    openWith([{ ...cartItemFixture(), quantity: 2 }]);
    const user = userEvent.setup();
    render(<CartDrawer />);

    await user.click(screen.getByRole('button', { name: 'Increase quantity' }));
    expect(useCartStore.getState().items[0].quantity).toBe(3);

    await user.click(screen.getByRole('button', { name: 'Decrease quantity' }));
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it('removes a line from the cart', async () => {
    openWith([cartItemFixture()]);
    const user = userEvent.setup();
    render(<CartDrawer />);

    await user.click(screen.getByRole('button', { name: 'Remove Aurora Pro 14 Ultrabook' }));

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('closes from the close button', async () => {
    openWith([cartItemFixture()]);
    const user = userEvent.setup();
    render(<CartDrawer />);

    await user.click(screen.getByRole('button', { name: 'Close cart' }));

    expect(useCartStore.getState().isOpen).toBe(false);
  });

  it('closes from the backdrop', async () => {
    openWith([cartItemFixture()]);
    const user = userEvent.setup();
    const { container } = render(<CartDrawer />);

    const backdrop = container.querySelector('.fixed.inset-0') as HTMLElement;
    await user.click(backdrop);

    expect(useCartStore.getState().isOpen).toBe(false);
  });

  it('closes from the continue shopping link', async () => {
    openWith([cartItemFixture()]);
    const user = userEvent.setup();
    render(<CartDrawer />);

    await user.click(screen.getByRole('button', { name: 'Continue shopping' }));

    expect(useCartStore.getState().isOpen).toBe(false);
  });

  it('closes when checking out', async () => {
    openWith([cartItemFixture()]);
    const user = userEvent.setup();
    render(<CartDrawer />);

    const checkout = screen.getByRole('link', { name: 'Checkout' });
    expect(checkout).toHaveAttribute('href', '/checkout');
    checkout.addEventListener('click', (event) => event.preventDefault());

    await user.click(checkout);

    expect(useCartStore.getState().isOpen).toBe(false);
  });

  it('shows the item count badge in the header', () => {
    openWith([cartItemFixture(), cartItemFixture({ id: 'product-2', slug: 'buds' })]);
    render(<CartDrawer />);

    const heading = screen.getByRole('heading', { name: 'Your cart' }).closest('header');
    expect(within(heading as HTMLElement).getByText('2')).toBeInTheDocument();
  });
});
