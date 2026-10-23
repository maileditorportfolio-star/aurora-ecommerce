import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal';

describe('Reveal', () => {
  it('renders children', () => {
    render(<Reveal>Content</Reveal>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('uses up direction by default', () => {
    const { container } = render(<Reveal>Up</Reveal>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies down direction offset', () => {
    const { container } = render(<Reveal direction="down">Down</Reveal>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies left direction offset', () => {
    const { container } = render(<Reveal direction="left">Left</Reveal>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies right direction offset', () => {
    const { container } = render(<Reveal direction="right">Right</Reveal>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies none direction', () => {
    const { container } = render(<Reveal direction="none">None</Reveal>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies custom delay', () => {
    const { container } = render(<Reveal delay={200}>Delayed</Reveal>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('merges custom className', () => {
    const { container } = render(<Reveal className="custom">C</Reveal>);
    expect((container.firstChild as HTMLElement)?.className).toContain('custom');
  });
});

describe('Stagger', () => {
  it('renders children', () => {
    render(
      <Stagger>
        <StaggerItem>Item 1</StaggerItem>
        <StaggerItem>Item 2</StaggerItem>
      </Stagger>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('applies custom delay', () => {
    const { container } = render(
      <Stagger delay={100}>
        <StaggerItem>Delayed</StaggerItem>
      </Stagger>,
    );
    expect(screen.getByText('Delayed')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    const { container } = render(
      <Stagger className="custom">
        <StaggerItem>C</StaggerItem>
      </Stagger>,
    );
    expect((container.firstChild as HTMLElement)?.className).toContain('custom');
  });
});

describe('StaggerItem', () => {
  it('renders children', () => {
    render(<StaggerItem>Item</StaggerItem>);
    expect(screen.getByText('Item')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    const { container } = render(<StaggerItem className="custom">I</StaggerItem>);
    expect((container.firstChild as HTMLElement)?.className).toContain('custom');
  });
});
