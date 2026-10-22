'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Boxes, Pencil, Plus, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { api } from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

interface Draft {
  name: string;
  description: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  imageUrl: string;
  featured: boolean;
}

const emptyDraft: Draft = {
  name: '',
  description: '',
  price: '',
  compareAtPrice: '',
  stock: '0',
  imageUrl: '',
  featured: false,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.products
      .list({ search: search || undefined, limit: 48 })
      .then(({ items }) => setProducts(items))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(load, 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreate = () => {
    setDraft(emptyDraft);
    setEditing(null);
    setCreating(true);
    setError(null);
  };

  const openEdit = (product: Product) => {
    setDraft({
      name: product.name,
      description: product.description,
      price: String(product.price),
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : '',
      stock: String(product.stock),
      imageUrl: product.imageUrl ?? '',
      featured: product.featured,
    });
    setCreating(false);
    setEditing(product);
    setError(null);
  };

  const close = () => {
    setEditing(null);
    setCreating(false);
    setError(null);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: draft.name,
      description: draft.description,
      price: Number(draft.price) || 0,
      compareAtPrice: draft.compareAtPrice ? Number(draft.compareAtPrice) : null,
      stock: Number(draft.stock) || 0,
      imageUrl: draft.imageUrl || null,
      featured: draft.featured,
      active: true,
    };

    try {
      if (editing) {
        await api.products.update(editing.id, payload);
      } else {
        await api.products.create(payload);
      }
      close();
      load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save the product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink-900">Products</h1>
          <p className="mt-1.5 text-sm text-ink-500">
            {loading ? 'Loading catalogue…' : `${products.length} products`}
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New product
        </Button>
      </motion.header>

      <div className="relative sm:max-w-xs">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products…"
          className="h-11 w-full rounded-full border border-ink-200 bg-white pl-11 pr-4 text-sm outline-none transition-shadow focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="h-56 animate-pulse rounded-3xl bg-ink-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-ink-200 bg-white p-16 text-center">
          <Boxes className="mx-auto h-8 w-8 text-ink-300" />
          <p className="mt-4 text-sm font-medium text-ink-700">No products yet</p>
          <Button size="sm" className="mt-5" onClick={openCreate}>
            Add the first product
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product, index) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.3) }}
              whileHover={{ y: -4 }}
              className="overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft"
            >
              <div className="flex gap-4 p-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-ink-100">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-indigo-200 to-sky-300" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{product.name}</p>
                  <p className="mt-1 text-sm font-bold text-indigo-700">
                    {formatCurrency(product.price)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant={
                        product.stock > 5 ? 'success' : product.stock > 0 ? 'warning' : 'danger'
                      }
                    >
                      {product.stock} in stock
                    </Badge>
                    {product.featured && <Badge variant="indigo">Featured</Badge>}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-ink-100 px-4 py-3">
                <span className="text-xs text-ink-400">
                  {product.category?.name ?? 'Uncategorised'}
                </span>
                <Button variant="ghost" size="sm" onClick={() => openEdit(product)}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <AnimatePresence>
        {(editing || creating) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-50 bg-ink-950/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-lg -translate-y-1/2 overflow-y-auto rounded-3xl bg-white p-6 shadow-card sm:inset-x-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight text-ink-900">
                  {creating ? 'New product' : 'Edit product'}
                </h2>
                <button
                  onClick={close}
                  aria-label="Close"
                  className="grid h-9 w-9 place-items-center rounded-full text-ink-500 transition-colors hover:bg-ink-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={save} className="mt-6 flex flex-col gap-4">
                <Input
                  label="Name"
                  required
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                />
                <Textarea
                  label="Description"
                  required
                  value={draft.description}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input
                    label="Price"
                    type="number"
                    min={0}
                    required
                    value={draft.price}
                    onChange={(event) => setDraft({ ...draft, price: event.target.value })}
                  />
                  <Input
                    label="Compare at"
                    type="number"
                    min={0}
                    value={draft.compareAtPrice}
                    onChange={(event) => setDraft({ ...draft, compareAtPrice: event.target.value })}
                  />
                  <Input
                    label="Stock"
                    type="number"
                    min={0}
                    value={draft.stock}
                    onChange={(event) => setDraft({ ...draft, stock: event.target.value })}
                  />
                </div>
                <Input
                  label="Image URL"
                  value={draft.imageUrl}
                  onChange={(event) => setDraft({ ...draft, imageUrl: event.target.value })}
                  placeholder="https://…"
                />

                <label className="flex items-center gap-2.5 text-sm font-medium text-ink-700">
                  <input
                    type="checkbox"
                    checked={draft.featured}
                    onChange={(event) => setDraft({ ...draft, featured: event.target.checked })}
                    className={cn(
                      'h-4 w-4 rounded border-ink-300 text-indigo-600 focus:ring-indigo-500',
                    )}
                  />
                  Feature on the storefront
                </label>

                {error && (
                  <p className="rounded-2xl bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
                    {error}
                  </p>
                )}

                <div className="mt-2 flex gap-3">
                  <Button type="submit" loading={saving} className="flex-1">
                    {creating ? 'Create product' : 'Save changes'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={close}>
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
