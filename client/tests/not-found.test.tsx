import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from '@/app/not-found';

describe('NotFound', () => {
  it('renders the 404 heading', () => {
    render(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders the not-found message', () => {
    render(<NotFound />);
    expect(screen.getByText(/We could not find that page/)).toBeInTheDocument();
  });

  it('renders a back home link', () => {
    render(<NotFound />);
    expect(screen.getByRole('link', { name: /Back home/ })).toHaveAttribute('href', '/');
  });

  it('renders a browse products link', () => {
    render(<NotFound />);
    expect(screen.getByRole('link', { name: /Browse products/ })).toHaveAttribute(
      'href',
      '/products',
    );
  });

  it('renders the search icon', () => {
    render(<NotFound />);
    // The SearchX icon renders as an SVG
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
