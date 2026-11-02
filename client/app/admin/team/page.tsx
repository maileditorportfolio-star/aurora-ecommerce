'use client';

import { useEffect, useState } from 'react';
import { Check, KeyRound, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { ALL_PERMISSIONS, PERMISSION_LABELS } from '@/lib/permissions';
import { useAuthStore } from '@/store/auth';
import { initials } from '@/lib/utils';
import type { AdminUser } from '@/types';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  permissions: ['products.write', 'orders.read'] as string[],
};

const togglePermission = (list: string[], permission: string) =>
  list.includes(permission) ? list.filter((item) => item !== permission) : [...list, permission];

function PermissionGrid({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (permission: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {ALL_PERMISSIONS.map((permission) => {
        const checked = selected.includes(permission);
        return (
          <label
            key={permission}
            className={`flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
              checked
                ? 'border-indigo-200 bg-indigo-50/70 text-indigo-900'
                : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onChange(permission)}
              className="mt-0.5 h-4 w-4 rounded border-ink-300 text-indigo-600 focus:ring-indigo-500"
            />
            {PERMISSION_LABELS[permission]}
          </label>
        );
      })}
    </div>
  );
}

export default function AdminTeamPage() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [permissions, setPermissions] = useState<string[]>(ALL_PERMISSIONS);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftPermissions, setDraftPermissions] = useState<string[]>([]);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const [team, available] = await Promise.all([
      api.admin.team.list(),
      api.admin.team.permissions(),
    ]);
    setUsers(team.users);
    setPermissions(available.permissions);
    setForm((current) => ({
      ...current,
      permissions: current.permissions.filter((permission) =>
        available.permissions.includes(permission),
      ),
    }));
  };

  useEffect(() => {
    if (!isSuperAdmin) return;

    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch((caught) => {
      if (active) {
        setError(caught instanceof Error ? caught.message : 'Could not load the team');
      }
    });

    return () => {
      active = false;
    };
  }, [isSuperAdmin]);

  const createAdmin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setError(null);
    setMessage(null);

    try {
      await api.admin.team.create(form);
      setForm(emptyForm);
      await load();
      setMessage(`${form.name} can now sign in with the selected permissions.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create the admin');
    } finally {
      setCreating(false);
    }
  };

  const savePermissions = async (id: string) => {
    setSavingPermissions(true);
    setError(null);
    setMessage(null);

    try {
      await api.admin.team.update(id, { permissions: draftPermissions });
      setEditingId(null);
      await load();
      setMessage('Permissions updated.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update permissions');
    } finally {
      setSavingPermissions(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-9 w-56 animate-pulse rounded-xl bg-ink-100" />
        <div className="h-5 w-80 animate-pulse rounded-lg bg-ink-100" />
        <div className="mt-4 h-80 animate-pulse rounded-3xl bg-ink-100" />
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return (
      <div className="rounded-3xl border border-ink-200 bg-white p-10 text-center">
        <ShieldCheck className="mx-auto h-8 w-8 text-ink-300" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink-900">
          Super administrator access required
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
          Only the super administrator can create staff accounts and choose their permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Access control
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-ink-900">
            Team &amp; permissions
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
            Create standard admins and choose exactly which parts of the console they can use. You
            keep full access as the super administrator.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-ink-950 px-4 py-2 text-xs font-semibold text-white">
          <ShieldCheck className="h-3.5 w-3.5 text-signal-300" />
          Super admin
        </span>
      </header>

      {error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
          {error}
        </p>
      )}
      {message && (
        <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
          <Check className="h-3.5 w-3.5" />
          {message}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form
          onSubmit={createAdmin}
          className="flex flex-col gap-4 rounded-3xl border border-ink-200/70 bg-white p-6 shadow-soft"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
            <UserPlus className="h-4 w-4 text-indigo-500" />
            New admin
          </div>

          <Input
            label="Full name"
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Store operator"
          />
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="operator@aurora.com"
          />
          <Input
            label="Temporary password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            hint="At least 8 characters. Share it securely and ask them to change it."
          />

          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-900">
              <KeyRound className="h-4 w-4 text-indigo-500" />
              Permissions
            </p>
            <PermissionGrid
              selected={form.permissions}
              onChange={(permission) =>
                setForm({ ...form, permissions: togglePermission(form.permissions, permission) })
              }
            />
          </div>

          <Button type="submit" size="lg" loading={creating}>
            <UserPlus className="h-4 w-4" />
            Create admin
          </Button>
        </form>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              <Users className="h-4 w-4 text-indigo-500" />
              Staff accounts
            </h2>
            <span className="text-xs text-ink-400">{users.length} accounts</span>
          </div>

          {users.map((admin) => {
            const editing = editingId === admin.id;
            const isSuper = admin.role === 'SUPER_ADMIN';

            return (
              <article
                key={admin.id}
                className="rounded-3xl border border-ink-200/70 bg-white p-5 shadow-soft"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-ink-950 text-xs font-bold text-white">
                      {initials(admin.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-900">{admin.name}</p>
                      <p className="truncate text-xs text-ink-500">{admin.email}</p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                      isSuper ? 'bg-signal-300 text-ink-950' : 'bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    {isSuper ? 'Super admin' : 'Admin'}
                  </span>
                </div>

                {isSuper ? (
                  <p className="mt-4 rounded-2xl bg-ink-50 px-4 py-3 text-xs text-ink-500">
                    Full access to every console surface, including team management and design.
                  </p>
                ) : editing ? (
                  <div className="mt-4 flex flex-col gap-3">
                    <PermissionGrid
                      selected={draftPermissions}
                      onChange={(permission) =>
                        setDraftPermissions((current) => togglePermission(current, permission))
                      }
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        loading={savingPermissions}
                        onClick={() => savePermissions(admin.id)}
                      >
                        Save permissions
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(null);
                          setDraftPermissions([]);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {admin.permissions.length === 0 ? (
                      <span className="rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-medium text-ink-500">
                        No permissions
                      </span>
                    ) : (
                      admin.permissions.map((permission) => (
                        <span
                          key={permission}
                          className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700"
                        >
                          {PERMISSION_LABELS[permission] ?? permission}
                        </span>
                      ))
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto"
                      onClick={() => {
                        setEditingId(admin.id);
                        setDraftPermissions(admin.permissions);
                      }}
                    >
                      Edit access
                    </Button>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
