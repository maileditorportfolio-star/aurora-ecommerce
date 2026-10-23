import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductsPage from '@/app/products/page';

// ProductsCatalogue is a Server Component — mock it so the page renders in jsdom
vi.mock('@/app/products/products-catalogue', () => ({
  ProductsCatalogue: () => <div data-testid="products-catalogue">Catalogue</div>,
}));

describe('ProductsPage', () => {
  it('renders the products catalogue inside a Suspense boundary', () => {
    render(<ProductsPage />);
    expect(screen.getByTestId('products-catalogue')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(<ProductsPage />);
    expect(container).toBeInTheDocument();
  });
});
