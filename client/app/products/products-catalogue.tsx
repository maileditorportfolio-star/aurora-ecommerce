'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutGrid, Search, SlidersHorizontal, X } from 'lucide-react';
import { ProductGrid } from '@/components/product/product-grid';
import { Button } from '@/components/ui/button';
import { SkeletonList } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Category, Product } from '@/types';

const sorts = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'popular', label: 'Most reviewed' },
];

export function ProductsCatalogue() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [sort, setSort] = useState('newest');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      api.products
        .list({ search: search || undefined, category: category || undefined, sort, limit: 24 })
        .then((data) => {
          setProducts(data.items);
          setCategories(data.categories);
        })
        .catch(() => undefined)
        .finally(() => setLoading(false));
    }, 220);

    return () => clearTimeout(timer);
  }, [search, category, sort]);

  const activeCategory = useMemo(
    () => categories.find((item) => item.slug === category)?.name,
    [categories, category],
  );

  return (
    <div className="container-page py-12 sm:py-16">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl"
      >
        <h1 className="text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">The catalogue</h1>
        <p className="mt-3 text-base text-ink-500">
          {loading ? 'Loading products…' : `${products.length} products ready to ship`}
          {activeCategory ? ` in ${activeCategory}` : ''}.
        </p>
      </motion.header>

      <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products…"
            className="h-12 w-full rounded-full border border-ink-200 bg-white pl-11 pr-4 text-sm outline-none transition-shadow focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-11 rounded-full border border-ink-200 bg-white px-4 text-sm font-medium text-ink-700 outline-none focus:border-indigo-400"
          >
            {sorts.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden lg:hidden"
          >
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((item) => (
                <CategoryChip
                  key={item.id}
                  label={item.name}
                  active={category === item.slug}
                  onClick={() => setCategory(category === item.slug ? '' : item.slug)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl border border-ink-100 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              <LayoutGrid className="h-4 w-4 text-indigo-500" />
              Categories
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              <button
                onClick={() => setCategory('')}
                className={cn(
                  'rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors',
                  category === '' ? 'bg-indigo-50 text-indigo-700' : 'text-ink-600 hover:bg-ink-50',
                )}
              >
                All products
              </button>
              {categories.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCategory(item.slug)}
                  className={cn(
                    'rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors',
                    category === item.slug
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-ink-600 hover:bg-ink-50',
                  )}
                >
                  {item.name}
                </button>
              ))}
            </div>

            {category && (
              <button
                onClick={() => setCategory('')}
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 transition-colors hover:text-rose-600"
              >
                <X className="h-3.5 w-3.5" />
                Clear filter
              </button>
            )}
          </div>
        </aside>

        <div>
          {loading ? (
            <SkeletonList count={6} />
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-ink-200 bg-white p-16 text-center">
              <p className="text-sm font-medium text-ink-700">No products matched your filters.</p>
              <button
                onClick={() => {
                  setSearch('');
                  setCategory('');
                }}
                className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Reset everything
              </button>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
        active
          ? 'border-indigo-600 bg-indigo-600 text-white'
          : 'border-ink-200 bg-white text-ink-600 hover:border-indigo-300',
      )}
    >
      {label}
    </button>
  );
}
