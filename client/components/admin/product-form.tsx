'use client';

import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

export interface ProductDraft {
  name: string;
  description: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  imageUrl: string;
  featured: boolean;
}

export const emptyProductDraft: ProductDraft = {
  name: '',
  description: '',
  price: '',
  compareAtPrice: '',
  stock: '0',
  imageUrl: '',
  featured: false,
};

export const draftFromProduct = (product: Product): ProductDraft => ({
  name: product.name,
  description: product.description,
  price: String(product.price),
  compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : '',
  stock: String(product.stock),
  imageUrl: product.imageUrl ?? '',
  featured: product.featured,
});

export const payloadFromDraft = (draft: ProductDraft) => ({
  name: draft.name,
  description: draft.description,
  price: Number(draft.price) || 0,
  compareAtPrice: draft.compareAtPrice ? Number(draft.compareAtPrice) : null,
  stock: Number(draft.stock) || 0,
  imageUrl: draft.imageUrl || null,
  featured: draft.featured,
  active: true,
});

export interface SaveProductOptions {
  editingId?: string | null;
  draft: ProductDraft;
}

/** Creates or updates a product from the current draft. */
export const saveProduct = async ({ editingId, draft }: SaveProductOptions) => {
  const payload = payloadFromDraft(draft);

  if (editingId) {
    const { product } = await api.products.update(editingId, payload);
    return product;
  }

  const { product } = await api.products.create(payload);
  return product;
};

export interface ProductFormProps {
  draft: ProductDraft;
  onChange: (draft: ProductDraft) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  saving: boolean;
  creating: boolean;
  error: string | null;
}

export function ProductForm({
  draft,
  onChange,
  onSubmit,
  onCancel,
  saving,
  creating,
  error,
}: ProductFormProps) {
  const update = (patch: Partial<ProductDraft>) => onChange({ ...draft, ...patch });

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
      <Input
        label="Name"
        required
        value={draft.name}
        onChange={(e) => update({ name: e.target.value })}
      />
      <Textarea
        label="Description"
        required
        value={draft.description}
        onChange={(e) => update({ description: e.target.value })}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Price"
          type="number"
          min={0}
          required
          value={draft.price}
          onChange={(e) => update({ price: e.target.value })}
        />
        <Input
          label="Compare at"
          type="number"
          min={0}
          value={draft.compareAtPrice}
          onChange={(e) => update({ compareAtPrice: e.target.value })}
        />
        <Input
          label="Stock"
          type="number"
          min={0}
          value={draft.stock}
          onChange={(e) => update({ stock: e.target.value })}
        />
      </div>
      <Input
        label="Image URL"
        value={draft.imageUrl}
        onChange={(e) => update({ imageUrl: e.target.value })}
        placeholder="https://…"
      />

      <label className="flex items-center gap-2.5 text-sm font-medium text-ink-700">
        <input
          type="checkbox"
          checked={draft.featured}
          onChange={(e) => update({ featured: e.target.checked })}
          className={cn('h-4 w-4 rounded border-ink-300 text-indigo-600 focus:ring-indigo-500')}
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
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default ProductForm;
