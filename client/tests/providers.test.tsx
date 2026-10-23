import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Providers } from '@/app/providers';

const { mockMe, mockSetToken } = vi.hoisted(() => ({
  mockMe: vi.fn().mockResolvedValue({ user: null }),
  mockSetToken: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  api: {
    auth: {
      me: mockMe,
    },
  },
  setToken: mockSetToken,
  getToken: () => null,
}));

describe('Providers', () => {
  it('renders children', () => {
    render(
      <Providers>
        <p>Child content</p>
      </Providers>,
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('calls api.auth.me on mount via hydrate', async () => {
    render(
      <Providers>
        <p>Test</p>
      </Providers>,
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(mockMe).toHaveBeenCalled();
  });

  it('renders multiple children', () => {
    render(
      <Providers>
        <h1>Title</h1>
        <p>Body</p>
      </Providers>,
    );
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });
});
