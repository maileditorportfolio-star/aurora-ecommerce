'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, ShoppingBag, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { cn, discountPercent, formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const addItem = useCartStore((state) => state.addItem);
  const discount = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.stock <= 0;
  const lowStock = !soldOut && product.stock <= 5;

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-ink-200/70 bg-white shadow-soft transition-shadow duration-300 hover:border-indigo-200 hover:shadow-card"
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-ink-100"
      >
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-indigo-200 via-indigo-300 to-cyan-300 transition-transform duration-700 group-hover:scale-105" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.featured && <Badge variant="indigo">Featured</Badge>}
          {discount > 0 && <Badge variant="danger">-{discount}%</Badge>}
          {soldOut && <Badge variant="outline">Sold out</Badge>}
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          {soldOut ? (
            <span className="rounded-full border border-white/20 bg-ink-950/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">
              Sold out
            </span>
          ) : lowStock ? (
            <span className="rounded-full bg-signal-300 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-950">
              Only {product.stock} left
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-ink-950/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-300" />
              In stock
            </span>
          )}
        </div>

        <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-ink-950/50 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          {product.category ? (
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600">
              {product.category.name}
            </span>
          ) : (
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">
              Aurora
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-ink-50 px-2 py-1 text-[11px] font-semibold text-ink-600">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)}
          </span>
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-2 line-clamp-2 font-display text-lg font-semibold leading-snug tracking-tight text-ink-900 transition-colors group-hover:text-indigo-700">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-500">
          <span>({product.reviewCount} reviews)</span>
          <span className="h-1 w-1 rounded-full bg-ink-300" />
          <span>{product.stock > 0 ? 'Ready to ship' : 'Restocking soon'}</span>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-500">
          {product.description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="font-display text-xl font-bold tracking-tight text-ink-900">
              {formatCurrency(product.price)}
            </p>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <p className={cn('text-xs text-ink-400 line-through')}>
                {formatCurrency(product.compareAtPrice)}
              </p>
            )}
          </div>

          <Button
            size="sm"
            variant="ink"
            disabled={soldOut}
            onClick={() => addItem(product)}
            aria-label={`Add ${product.name} to cart`}
            className="shrink-0"
          >
            <ShoppingBag className="h-4 w-4" />
            {soldOut ? 'Sold out' : 'Add'}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

export default ProductCard;
