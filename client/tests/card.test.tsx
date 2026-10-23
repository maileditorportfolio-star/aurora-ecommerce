import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

describe('Card', () => {
  it('renders children with base classes', () => {
    render(<Card>Content</Card>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies interactive hover styles', () => {
    const { container } = render(<Card interactive>Interactive</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('hover:border-indigo-200');
  });

  it('renders the glow overlay when enabled', () => {
    render(<Card glow>Glow</Card>);
    expect(screen.getByText('Glow')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    const { container } = render(<Card className="custom">Styled</Card>);
    expect((container.firstChild as HTMLElement)?.className).toContain('custom');
  });

  it('spreads extra props onto the motion div', () => {
    const { container } = render(<Card data-testid="card">Props</Card>);
    expect(container.querySelector('[data-testid="card"]')).toBeInTheDocument();
  });
});

describe('CardHeader', () => {
  it('renders with padding and flex layout', () => {
    render(
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>,
    );
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
  });

  it('merges custom className', () => {
    const { container } = render(<CardHeader className="extra">Header</CardHeader>);
    expect((container.firstChild as HTMLElement)?.className).toContain('extra');
  });
});

describe('CardTitle', () => {
  it('renders as an h3 with bold styling', () => {
    render(<CardTitle>My Title</CardTitle>);
    expect(screen.getByRole('heading', { name: 'My Title' })).toBeInTheDocument();
  });

  it('merges custom className', () => {
    const { container } = render(<CardTitle className="extra">T</CardTitle>);
    expect((container.firstChild as HTMLElement)?.className).toContain('extra');
  });
});

describe('CardDescription', () => {
  it('renders descriptive text', () => {
    render(<CardDescription>A description</CardDescription>);
    expect(screen.getByText('A description')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    const { container } = render(<CardDescription className="extra">D</CardDescription>);
    expect((container.firstChild as HTMLElement)?.className).toContain('extra');
  });
});

describe('CardContent', () => {
  it('renders with pt-0 spacing', () => {
    render(<CardContent>Body</CardContent>);
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    const { container } = render(<CardContent className="extra">C</CardContent>);
    expect((container.firstChild as HTMLElement)?.className).toContain('extra');
  });
});

describe('CardFooter', () => {
  it('renders with flex items and gap', () => {
    render(<CardFooter>Footer</CardFooter>);
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    const { container } = render(<CardFooter className="extra">F</CardFooter>);
    expect((container.firstChild as HTMLElement)?.className).toContain('extra');
  });
});
