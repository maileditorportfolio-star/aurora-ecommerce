import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartPage from '@/app/cart/page';
import { useCartStore } from '@/store/cart';
import { cartItemFixture } from './fixtures';
import { money } from './money';

describe('CartPage', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false });
  });

  it('shows the empty state with a catalogue link', () => {
    render(<CartPage />);

    expect(screen.getByRole('heading', { name: 'Your cart is empty' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Start shopping/ })).toHaveAttribute(
      'href',
      '/products',
    );
  });

  it('lists the lines and totals with free delivery above the threshold', () => {
    useCartStore.setState({ items: [{ ...cartItemFixture(), quantity: 2 }] });
    render(<CartPage />);

    expect(screen.getByRole('heading', { name: 'Your cart' })).toBeInTheDocument();
    expect(screen.getByText('Aurora Pro 14 Ultrabook')).toBeInTheDocument();
    expect(screen.getByText('You unlocked free delivery.')).toBeInTheDocument();
    expect(screen.getAllByText(money(236000)).length).toBeGreaterThan(0);
  });

  it('prompts for the remaining amount below the threshold', () => {
    useCartStore.setState({ items: [{ ...cartItemFixture({ price: 100 }), quantity: 1 }] });
    render(<CartPage />);

    expect(screen.getByText(/Add .*4,900 more for free delivery\./)).toBeInTheDocument();
    expect(screen.getByText(money(60))).toBeInTheDocument();
    expect(screen.getByText(money(160))).toBeInTheDocument();
  });

  it('updates quantities and removes lines', async () => {
    useCartStore.setState({ items: [{ ...cartItemFixture(), quantity: 2 }] });
    const user = userEvent.setup();
    render(<CartPage />);

    await user.click(screen.getByRole('button', { name: 'Increase quantity' }));
    expect(useCartStore.getState().items[0].quantity).toBe(3);

    await user.click(screen.getByRole('button', { name: 'Decrease quantity' }));
    expect(useCartStore.getState().items[0].quantity).toBe(2);

    await user.click(screen.getByRole('button', { name: 'Remove Aurora Pro 14 Ultrabook' }));
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('offers checkout and continue-shopping actions', () => {
    useCartStore.setState({ items: [cartItemFixture()] });
    render(<CartPage />);

    expect(screen.getByRole('link', { name: /Proceed to checkout/ })).toHaveAttribute(
      'href',
      '/checkout',
    );
    expect(screen.getByRole('link', { name: 'Continue shopping' })).toHaveAttribute(
      'href',
      '/products',
    );
  });
});
