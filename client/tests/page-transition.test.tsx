import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageTransition } from '@/components/motion/page-transition';

describe('PageTransition', () => {
  it('renders children', () => {
    render(
      <PageTransition>
        <p>Content</p>
      </PageTransition>,
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies min-h-[60vh] base class', () => {
    const { container } = render(<PageTransition>Content</PageTransition>);
    expect((container.firstChild as HTMLElement)?.className).toContain('min-h-[60vh]');
  });

  it('applies custom className', () => {
    const { container } = render(<PageTransition className="custom">Content</PageTransition>);
    expect((container.firstChild as HTMLElement)?.className).toContain('custom');
  });

  it('renders multiple children', () => {
    render(
      <PageTransition>
        <h1>Heading</h1>
        <p>Paragraph</p>
      </PageTransition>,
    );
    expect(screen.getByRole('heading', { name: 'Heading' })).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
  });
});
