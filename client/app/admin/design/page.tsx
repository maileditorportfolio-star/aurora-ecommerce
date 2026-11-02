'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Palette, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { api } from '@/lib/api';
import { DEFAULT_STOREFRONT_SETTINGS } from '@/lib/permissions';
import { useAuthStore } from '@/store/auth';
import type { Product, StorefrontSettings } from '@/types';

const toggles: Array<{ key: keyof StorefrontSettings; label: string; hint: string }> = [
  { key: 'showMarquee', label: 'Category marquee', hint: 'Scrolling strip under the hero' },
  { key: 'showCategories', label: 'Category rail', hint: 'Shop by discipline section' },
  { key: 'showFeatures', label: 'Why Aurora', hint: 'Editorial feature list' },
];

export default function AdminDesignPage() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const allowed =
    user?.role === 'SUPER_ADMIN' ||
    (user?.role === 'ADMIN' && (user.permissions ?? []).includes('design.write'));

  const [settings, setSettings] = useState<StorefrontSettings>(DEFAULT_STOREFRONT_SETTINGS);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!allowed) return;

    let active = true;
    Promise.all([api.admin.storefront.get(), api.products.list({ limit: 48 })])
      .then(([settingsResponse, productResponse]) => {
        if (!active) return;
        setSettings({ ...DEFAULT_STOREFRONT_SETTINGS, ...settingsResponse.settings });
        setProducts(productResponse.items);
      })
      .catch((caught) => {
        if (active) setError(caught instanceof Error ? caught.message : 'Could not load settings');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [allowed]);

  const update = (patch: Partial<StorefrontSettings>) => {
    setMessage(null);
    setSettings((current) => ({ ...current, ...patch }));
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const { settings: saved } = await api.admin.storefront.update(settings);
      setSettings({ ...DEFAULT_STOREFRONT_SETTINGS, ...saved });
      setMessage('Saved. The storefront picks this up on the next load.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save the design');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || (allowed && loading)) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-9 w-64 animate-pulse rounded-xl bg-ink-100" />
        <div className="h-5 w-96 animate-pulse rounded-lg bg-ink-100" />
        <div className="mt-4 h-[28rem] animate-pulse rounded-3xl bg-ink-100" />
      </div>
    );
  }

  if (!user || !allowed) {
    return (
      <div className="rounded-3xl border border-ink-200 bg-white p-10 text-center">
        <Palette className="mx-auto h-8 w-8 text-ink-300" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink-900">
          Design access required
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
          Only the super administrator or an admin granted “Edit storefront design” can change the
          storefront.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Storefront control
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-ink-900">
          Storefront design
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
          Edit the live hero copy, announcement bar, featured product and which home sections are
          visible. Changes apply to the storefront immediately after saving.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <form
          onSubmit={save}
          className="flex flex-col gap-5 rounded-3xl border border-ink-200/70 bg-white p-6 shadow-soft"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            Hero content
          </div>

          <Input
            label="Announcement bar"
            value={settings.announcement}
            maxLength={120}
            onChange={(event) => update({ announcement: event.target.value })}
          />
          <Input
            label="Eyebrow"
            value={settings.heroEyebrow}
            maxLength={80}
            onChange={(event) => update({ heroEyebrow: event.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Headline"
              value={settings.heroTitle}
              maxLength={100}
              onChange={(event) => update({ heroTitle: event.target.value })}
            />
            <Input
              label="Highlight word"
              value={settings.heroHighlight}
              maxLength={60}
              onChange={(event) => update({ heroHighlight: event.target.value })}
            />
          </div>
          <Textarea
            label="Hero description"
            value={settings.heroDescription}
            maxLength={500}
            onChange={(event) => update({ heroDescription: event.target.value })}
          />

          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-700">
            Featured hero product
            <select
              value={settings.heroProductSlug ?? ''}
              onChange={(event) => update({ heroProductSlug: event.target.value || null })}
              className="h-12 rounded-2xl border border-ink-200 bg-white px-4 text-sm text-ink-900 outline-none focus:border-indigo-400"
            >
              <option value="">Auto (prefer the ultrabook)</option>
              {products.map((product) => (
                <option key={product.id} value={product.slug}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-2 rounded-2xl border border-ink-200 p-4">
            <p className="text-sm font-semibold text-ink-900">Home sections</p>
            {toggles.map((toggle) => (
              <label
                key={toggle.key}
                className="flex items-center justify-between gap-4 rounded-xl px-1 py-2"
              >
                <span>
                  <span className="block text-sm font-medium text-ink-700">{toggle.label}</span>
                  <span className="block text-xs text-ink-400">{toggle.hint}</span>
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(settings[toggle.key])}
                  onChange={(event) => update({ [toggle.key]: event.target.checked })}
                  className="h-4 w-4 rounded border-ink-300 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            ))}
          </div>

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

          <Button type="submit" size="lg" loading={saving}>
            <Save className="h-4 w-4" />
            Save storefront
          </Button>
        </form>

        <aside className="xl:sticky xl:top-8 xl:self-start">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">
            Live preview
          </p>
          <motion.div
            layout
            className="relative overflow-hidden rounded-[2rem] bg-ink-950 p-7 text-white shadow-card"
          >
            <div aria-hidden className="absolute inset-0 bg-aurora-deep opacity-80" />
            <div
              aria-hidden
              className="absolute inset-0 bg-grid-fine bg-[length:28px_28px] opacity-25"
            />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-200">
                <span className="h-1.5 w-1.5 rounded-full bg-signal-300" />
                {settings.heroEyebrow || 'Eyebrow'}
              </span>
              <h2 className="mt-5 text-balance text-3xl font-bold leading-[1.02] tracking-[-0.03em]">
                {settings.heroTitle || 'Headline'}{' '}
                <span className="text-gradient-light">{settings.heroHighlight || 'highlight'}</span>
                .
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-300">
                {settings.heroDescription || 'Hero description'}
              </p>
              <div className="mt-6 flex gap-2">
                <span className="inline-flex h-10 items-center rounded-full bg-signal-300 px-5 text-sm font-semibold text-ink-950">
                  Explore
                </span>
                <span className="inline-flex h-10 items-center rounded-full border border-white/15 bg-white/5 px-5 text-sm font-medium text-white">
                  Why Aurora
                </span>
              </div>
              <div className="mt-7 border-t border-white/10 pt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">
                {settings.announcement || 'Announcement bar'}
              </div>
            </div>
          </motion.div>
          <p className="mt-3 text-xs leading-relaxed text-ink-500">
            This is the exact hero copy the storefront renders. The selected product supplies the
            hero image and price card.
          </p>
        </aside>
      </div>
    </div>
  );
}
