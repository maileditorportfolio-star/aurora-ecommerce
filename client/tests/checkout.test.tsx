import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckoutPage from '@/app/checkout/page';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';

const createOrder = vi.fn();

vi.mock('@/lib/api', () => ({
  api: {
    orders: {
      create: (...args: unknown[]) => createOrder(...args),
    },
  },
}));

const user = {
  id: 'user-1',
  name: 'Nafis Hasan',
  email: 'nafis@aurora.com',
  phone: '+8801800000000',
  role: 'CUSTOMER' as const,
  avatarUrl: null,
};

const cartItem = {
  productId: 'product-1',
  slug: 'aurora-pro-14',
  name: 'Aurora Pro 14 Ultrabook',
  price: 118000,
  imageUrl: null,
  stock: 10,
  quantity: 1,
};

const setCart = (items: (typeof cartItem)[]) => useCartStore.setState({ items, isOpen: false });

describe('CheckoutPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ user, token: 'test-token', isLoading: false, error: null });
    setCart([cartItem]);
    createOrder.mockReset();
    createOrder.mockResolvedValue({ order: { orderNumber: 'AUR-ABC-1234' } });
  });

  it('prompts the customer to sign in when there is no session', async () => {
    useAuthStore.setState({ user: null, token: null });

    render(<CheckoutPage />);

    expect(await screen.findByText('Sign in to continue')).toBeInTheDocument();
  });

  it('tells the customer the cart is empty when there are no items', async () => {
    setCart([]);

    render(<CheckoutPage />);

    expect(await screen.findByText('Nothing to check out')).toBeInTheDocument();
  });

  it('prefills the delivery form with the signed-in customer details', async () => {
    render(<CheckoutPage />);

    expect(await screen.findByLabelText('Full name')).toHaveValue('Nafis Hasan');
    expect(screen.getByLabelText('Phone number')).toHaveValue('+8801800000000');
  });

  it('lists the cart items in the order summary', async () => {
    render(<CheckoutPage />);

    expect(await screen.findByText('Aurora Pro 14 Ultrabook')).toBeInTheDocument();
    expect(screen.getByText('Order summary')).toBeInTheDocument();
  });

  it('shows free delivery once the subtotal passes the threshold', async () => {
    render(<CheckoutPage />);

    expect(await screen.findByText('Free')).toBeInTheDocument();
  });

  it('charges the delivery fee for a small order', async () => {
    setCart([{ ...cartItem, price: 500, quantity: 1 }]);

    render(<CheckoutPage />);

    expect(await screen.findByText('Total')).toBeInTheDocument();
    expect(screen.getByText(/BDT\s*60/)).toBeInTheDocument();
    expect(screen.getByText(/BDT\s*560/)).toBeInTheDocument();
  });

  it('submits the order and confirms it with the order number', async () => {
    const user_ = userEvent.setup();
    render(<CheckoutPage />);

    await user_.type(await screen.findByLabelText('Address'), 'House 1, Road 2, Dhaka 1207');
    await user_.click(screen.getByRole('button', { name: /place order/i }));

    expect(await screen.findByText('Order confirmed')).toBeInTheDocument();
    expect(screen.getByText('AUR-ABC-1234')).toBeInTheDocument();

    expect(createOrder).toHaveBeenCalledTimes(1);
    expect(createOrder.mock.calls[0][0]).toMatchObject({
      items: [{ productId: 'product-1', quantity: 1 }],
      shippingName: 'Nafis Hasan',
      shippingPhone: '+8801800000000',
      shippingAddress: 'House 1, Road 2, Dhaka 1207',
      shippingCountry: 'Bangladesh',
      paymentMethod: 'cod',
    });
  });

  it('empties the cart once the order is placed', async () => {
    const user_ = userEvent.setup();
    render(<CheckoutPage />);

    await user_.type(await screen.findByLabelText('Address'), 'House 1, Road 2, Dhaka 1207');
    await user_.click(screen.getByRole('button', { name: /place order/i }));

    await screen.findByText('Order confirmed');
    await waitFor(() => expect(useCartStore.getState().items).toHaveLength(0));
  });

  it('shows the failure message when the order cannot be placed', async () => {
    createOrder.mockRejectedValue(new Error('One or more products are no longer available'));
    const user_ = userEvent.setup();
    render(<CheckoutPage />);

    await user_.type(await screen.findByLabelText('Address'), 'House 1, Road 2, Dhaka 1207');
    await user_.click(screen.getByRole('button', { name: /place order/i }));

    expect(
      await screen.findByText('One or more products are no longer available'),
    ).toBeInTheDocument();
  });

  it('lets the customer pick a different payment method', async () => {
    const user_ = userEvent.setup();
    render(<CheckoutPage />);

    await user_.click(await screen.findByRole('button', { name: /bKash/i }));
    await user_.type(screen.getByLabelText('Address'), 'House 1, Road 2, Dhaka 1207');
    await user_.click(screen.getByRole('button', { name: /place order/i }));

    await screen.findByText('Order confirmed');
    expect(createOrder.mock.calls[0][0]).toMatchObject({ paymentMethod: 'bkash' });
  });
});
