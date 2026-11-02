import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Providers } from '@/app/providers';
import { useStorefrontSettings } from '@/components/providers/storefront-settings';
import { DEFAULT_STOREFRONT_SETTINGS } from '@/lib/permissions';

const { mockMe, mockSetToken } = vi.hoisted(() => ({
  mockMe: vi.fn().mockResolvedValue({ user: null }),
  mockSetToken: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  api: {
    auth: {
      me: mockMe,
    },
    storefront: {
      settings: vi.fn().mockResolvedValue({ settings: {} }),
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

  it('provides storefront settings to children', () => {
    function SettingsReader() {
      const settings = useStorefrontSettings();
      return <p>{settings.announcement}</p>;
    }

    render(
      <Providers>
        <SettingsReader />
      </Providers>,
    );

    expect(screen.getByText(DEFAULT_STOREFRONT_SETTINGS.announcement)).toBeInTheDocument();
  });
});
