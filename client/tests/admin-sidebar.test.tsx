import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminSidebar } from '@/components/admin/sidebar';
import { useAuthStore } from '@/store/auth';
import { userFixture } from './fixtures';

describe('AdminSidebar', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isLoading: false, error: null });
  });

  it('renders all navigation items', () => {
    render(<AdminSidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('renders the Aurora Console branding', () => {
    render(<AdminSidebar />);
    expect(screen.getByText('Aurora')).toBeInTheDocument();
    expect(screen.getByText('Console')).toBeInTheDocument();
  });

  it('renders the storefront link', () => {
    render(<AdminSidebar />);
    expect(screen.getByText('View storefront')).toBeInTheDocument();
  });

  it('shows guest user when not authenticated', () => {
    render(<AdminSidebar />);
    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });

  it('shows authenticated user name and email', () => {
    useAuthStore.setState({ user: userFixture });
    render(<AdminSidebar />);
    expect(screen.getByText('Nafis Hasan')).toBeInTheDocument();
    expect(screen.getByText('nafis@aurora.com')).toBeInTheDocument();
  });

  it('renders the sign out button', () => {
    useAuthStore.setState({ user: userFixture });
    render(<AdminSidebar />);
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });

  it('renders navigation links with correct hrefs', () => {
    render(<AdminSidebar />);
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/admin');
    expect(screen.getByText('Orders').closest('a')).toHaveAttribute('href', '/admin/orders');
    expect(screen.getByText('Products').closest('a')).toHaveAttribute('href', '/admin/products');
    expect(screen.getByText('Customers').closest('a')).toHaveAttribute('href', '/admin/customers');
    expect(screen.getByText('Analytics').closest('a')).toHaveAttribute('href', '/admin/analytics');
  });

  it('renders the mobile menu toggle button', () => {
    render(<AdminSidebar />);
    expect(screen.getByRole('button', { name: 'Toggle admin navigation' })).toBeInTheDocument();
  });
});
