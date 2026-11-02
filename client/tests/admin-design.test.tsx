import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminDesignPage from '@/app/admin/design/page';
import { useAuthStore } from '@/store/auth';
import { DEFAULT_STOREFRONT_SETTINGS } from '@/lib/permissions';
import { productFixture, userFixture } from './fixtures';

const getSettings = vi.fn();
const updateSettings = vi.fn();
const listProducts = vi.fn();

vi.mock('@/lib/api', () => ({
  api: {
    admin: {
      storefront: {
        get: (...args: unknown[]) => getSettings(...args),
        update: (...args: unknown[]) => updateSettings(...args),
      },
    },
    products: {
      list: (...args: unknown[]) => listProducts(...args),
    },
  },
}));

const superAdmin = { ...userFixture, role: 'SUPER_ADMIN' as const, permissions: [] };

describe('AdminDesignPage', () => {
  beforeEach(() => {
    getSettings.mockReset();
    updateSettings.mockReset();
    listProducts.mockReset();
    getSettings.mockResolvedValue({ settings: DEFAULT_STOREFRONT_SETTINGS });
    listProducts.mockResolvedValue({ items: [productFixture()] });
    useAuthStore.setState({
      user: superAdmin,
      token: 'jwt-token',
      isLoading: false,
      error: null,
    });
  });

  it('loads the live copy and renders the preview', async () => {
    render(<AdminDesignPage />);

    expect(
      await screen.findByDisplayValue(DEFAULT_STOREFRONT_SETTINGS.heroTitle),
    ).toBeInTheDocument();
    expect(getSettings).toHaveBeenCalledTimes(1);
    expect(listProducts).toHaveBeenCalledWith({ limit: 48 });
    expect(screen.getByText('Live preview')).toBeInTheDocument();
    expect(screen.getByDisplayValue(DEFAULT_STOREFRONT_SETTINGS.announcement)).toBeInTheDocument();
  });

  it('saves edited hero copy and section toggles', async () => {
    updateSettings.mockImplementation(async (payload) => ({
      settings: { ...DEFAULT_STOREFRONT_SETTINGS, ...payload },
    }));
    const user = userEvent.setup();
    render(<AdminDesignPage />);

    const headline = await screen.findByDisplayValue(DEFAULT_STOREFRONT_SETTINGS.heroTitle);
    await user.clear(headline);
    await user.type(headline, 'Built for the long run');
    await user.click(screen.getByRole('checkbox', { name: /Category marquee/ }));
    await user.click(screen.getByRole('button', { name: 'Save storefront' }));

    expect(updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ heroTitle: 'Built for the long run', showMarquee: false }),
    );
    expect(await screen.findByText(/Saved\./)).toBeInTheDocument();
  });

  it('denies an admin without design permission', () => {
    useAuthStore.setState({
      user: { ...userFixture, role: 'ADMIN', permissions: [] },
      token: 'jwt-token',
      isLoading: false,
    });

    render(<AdminDesignPage />);

    expect(screen.getByText('Design access required')).toBeInTheDocument();
    expect(getSettings).not.toHaveBeenCalled();
  });

  it('surfaces a save failure', async () => {
    updateSettings.mockRejectedValue(new Error('Missing permission: design.write'));
    const user = userEvent.setup();
    render(<AdminDesignPage />);

    await screen.findByDisplayValue(DEFAULT_STOREFRONT_SETTINGS.heroTitle);
    await user.click(screen.getByRole('button', { name: 'Save storefront' }));

    expect(await screen.findByText('Missing permission: design.write')).toBeInTheDocument();
  });
});
