import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
  it('renders with default variant styles', () => {
    const { container } = render(<Badge>Default</Badge>);
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect((container.firstChild as HTMLElement)?.className).toContain('bg-ink-100');
  });

  it('applies indigo variant styles', () => {
    const { container } = render(<Badge variant="indigo">Indigo</Badge>);
    expect((container.firstChild as HTMLElement)?.className).toContain('bg-indigo-100');
    expect((container.firstChild as HTMLElement)?.className).toContain('text-indigo-700');
  });

  it('applies success variant styles', () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    expect((container.firstChild as HTMLElement)?.className).toContain('bg-emerald-100');
  });

  it('applies warning variant styles', () => {
    const { container } = render(<Badge variant="warning">Warning</Badge>);
    expect((container.firstChild as HTMLElement)?.className).toContain('bg-amber-100');
  });

  it('applies danger variant styles', () => {
    const { container } = render(<Badge variant="danger">Danger</Badge>);
    expect((container.firstChild as HTMLElement)?.className).toContain('bg-rose-100');
  });

  it('applies outline variant styles', () => {
    const { container } = render(<Badge variant="outline">Outline</Badge>);
    expect((container.firstChild as HTMLElement)?.className).toContain('border');
    expect((container.firstChild as HTMLElement)?.className).toContain('text-ink-600');
  });

  it('renders pulse indicator when enabled', () => {
    render(<Badge pulse>Pulse</Badge>);
    expect(screen.getByText('Pulse')).toBeInTheDocument();
  });

  it('renders without pulse by default', () => {
    const { container } = render(<Badge>No Pulse</Badge>);
    expect(container.querySelector('span span')).toBeNull();
  });

  it('merges custom className', () => {
    const { container } = render(<Badge className="custom">Custom</Badge>);
    expect((container.firstChild as HTMLElement)?.className).toContain('custom');
  });

  it('spreads HTML attributes', () => {
    render(<Badge data-testid="badge">Attr</Badge>);
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });
});
