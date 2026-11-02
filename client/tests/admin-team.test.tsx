import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminTeamPage from '@/app/admin/team/page';
import { useAuthStore } from '@/store/auth';
import { ALL_PERMISSIONS } from '@/lib/permissions';
import { userFixture } from './fixtures';

const listTeam = vi.fn();
const listPermissions = vi.fn();
const createAdmin = vi.fn();
const updateAdmin = vi.fn();

vi.mock('@/lib/api', () => ({
  api: {
    admin: {
      team: {
        list: (...args: unknown[]) => listTeam(...args),
        permissions: (...args: unknown[]) => listPermissions(...args),
        create: (...args: unknown[]) => createAdmin(...args),
        update: (...args: unknown[]) => updateAdmin(...args),
      },
    },
  },
}));

const superAdmin = { ...userFixture, role: 'SUPER_ADMIN' as const, permissions: [] };
const operator = {
  id: 'admin-operator',
  name: 'Demo Operator',
  email: 'operator@aurora.com',
  role: 'ADMIN' as const,
  permissions: ['products.write', 'orders.read'],
  createdAt: '2026-10-22T00:00:00.000Z',
};

describe('AdminTeamPage', () => {
  beforeEach(() => {
    listTeam.mockReset();
    listPermissions.mockReset();
    createAdmin.mockReset();
    updateAdmin.mockReset();
    listTeam.mockResolvedValue({ users: [superAdmin, operator] });
    listPermissions.mockResolvedValue({ permissions: ALL_PERMISSIONS });
    createAdmin.mockResolvedValue({ user: operator });
    updateAdmin.mockResolvedValue({ user: operator });
    useAuthStore.setState({
      user: superAdmin,
      token: 'jwt-token',
      isLoading: false,
      error: null,
    });
  });

  it('lists staff accounts and their permissions', async () => {
    render(<AdminTeamPage />);

    const card = (await screen.findByText('Demo Operator')).closest('article') as HTMLElement;
    expect(within(card).getByText('Manage products')).toBeInTheDocument();
    expect(within(card).getByText('View orders')).toBeInTheDocument();
    expect(screen.getAllByText('Super admin').length).toBeGreaterThan(0);
  });

  it('creates an admin with the selected permissions', async () => {
    const user = userEvent.setup();
    render(<AdminTeamPage />);

    await screen.findByText('Demo Operator');
    await user.type(screen.getByLabelText('Full name'), 'Ops Admin');
    await user.type(screen.getByLabelText('Email'), 'ops@aurora.com');
    await user.type(screen.getByLabelText('Temporary password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Create admin' }));

    expect(createAdmin).toHaveBeenCalledWith({
      name: 'Ops Admin',
      email: 'ops@aurora.com',
      password: 'password123',
      permissions: ['products.write', 'orders.read'],
    });
    expect(await screen.findByText(/can now sign in/)).toBeInTheDocument();
  });

  it('updates the permissions of a standard admin', async () => {
    const user = userEvent.setup();
    render(<AdminTeamPage />);

    const card = (await screen.findByText('Demo Operator')).closest('article') as HTMLElement;
    await user.click(within(card).getByRole('button', { name: 'Edit access' }));
    await user.click(within(card).getByLabelText('Edit storefront design'));
    await user.click(within(card).getByRole('button', { name: 'Save permissions' }));

    expect(updateAdmin).toHaveBeenCalledWith('admin-operator', {
      permissions: ['products.write', 'orders.read', 'design.write'],
    });
  });

  it('denies a non-super admin', () => {
    useAuthStore.setState({
      user: { ...userFixture, role: 'ADMIN', permissions: ['products.write'] },
      token: 'jwt-token',
      isLoading: false,
    });

    render(<AdminTeamPage />);

    expect(screen.getByText('Super administrator access required')).toBeInTheDocument();
    expect(listTeam).not.toHaveBeenCalled();
  });
});
