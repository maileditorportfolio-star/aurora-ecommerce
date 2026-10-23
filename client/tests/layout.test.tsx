import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import SiteChrome from '@/components/layout/site-chrome';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { cartItemFixture, userFixture } from './fixtures';

vi.mock('@/components/chat/chat-widget', () => ({
  ChatWidget: () => <div data-testid="chat-widget" />,
}));

describe('Header', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false });
    useAuthStore.setState({ user: null, token: null, isLoading: false, error: null });
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
  });

  it('renders the primary navigation and the shop call to action', () => {
    render(<Header />);

    expect(screen.getByText('Aurora')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Shop now' })).toHaveAttribute('href', '/products');
    expect(screen.getAllByRole('link', { name: 'Shop' }).length).toBeGreaterThan(0);
  });

  it('shows a sign-in link for guests and an account link once signed in', () => {
    const { rerender } = render(<Header />);
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');

    useAuthStore.setState({ user: userFixture });
    rerender(<Header />);

    expect(screen.getByRole('link', { name: 'Your account' })).toHaveAttribute('href', '/account');
  });

  it('counts the cart items and opens the drawer', async () => {
    useCartStore.setState({
      items: [
        { ...cartItemFixture(), quantity: 2 },
        { ...cartItemFixture({ id: 'product-2', slug: 'phone', name: 'Phone' }), quantity: 1 },
      ],
    });
    const user = userEvent.setup();
    render(<Header />);

    const cartButton = screen.getByRole('button', { name: 'Cart with 3 items' });
    expect(screen.getByText('3')).toBeInTheDocument();

    await user.click(cartButton);

    expect(useCartStore.getState().isOpen).toBe(true);
  });

  it('toggles the mobile navigation menu', async () => {
    const user = userEvent.setup();
    render(<Header />);

    expect(screen.getAllByRole('link', { name: 'Categories' })).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Toggle navigation' }));

    expect(screen.getAllByRole('link', { name: 'Categories' })).toHaveLength(2);

    const mobileShop = screen.getAllByRole('link', { name: 'Shop' })[1];
    mobileShop.addEventListener('click', (event) => event.preventDefault());
    await user.click(mobileShop);

    await waitFor(() =>
      expect(screen.getAllByRole('link', { name: 'Categories' })).toHaveLength(1),
    );
  });

  it('frosts the header after the page is scrolled', () => {
    const { container } = render(<Header />);
    const header = container.querySelector('header') as HTMLElement;

    expect(header.className).not.toContain('glass');

    Object.defineProperty(window, 'scrollY', { value: 40, writable: true, configurable: true });
    fireEvent.scroll(window);

    expect(header.className).toContain('glass');
  });
});

describe('Footer', () => {
  it('renders the shop, company and support columns', () => {
    render(<Footer />);

    expect(screen.getByRole('heading', { name: 'Shop' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Company' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Support' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'All products' })).toHaveAttribute('href', '/products');
    expect(
      screen.getByText(new RegExp(`${new Date().getFullYear()} Aurora Cyber`)),
    ).toBeInTheDocument();
    expect(screen.getByText('All systems operational')).toBeInTheDocument();
  });
});

describe('SiteChrome', () => {
  it('wraps storefront pages with the header, footer and cart drawer', () => {
    render(
      <SiteChrome>
        <p>Storefront body</p>
      </SiteChrome>,
    );

    expect(screen.getByText('Storefront body')).toBeInTheDocument();
    expect(screen.getAllByText('Aurora').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Shop' })).toBeInTheDocument();
  });
});
