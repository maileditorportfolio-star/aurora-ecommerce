'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { cn, discountPercent, formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const addItem = useCartStore((state) => state.addItem);
  const discount = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.stock <= 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft transition-shadow duration-300 hover:shadow-card"
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-ink-100"
      >
        {product.imageUrl ? (
          <motion.img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
            initial={{ scale: 1.05 }}
            whileHover={{ scale: 1.12 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-indigo-200 via-indigo-300 to-sky-300 transition-transform duration-700 group-hover:scale-110" />
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.featured && <Badge variant="indigo">Featured</Badge>}
          {discount > 0 && <Badge variant="danger">-{discount}%</Badge>}
          {soldOut && <Badge variant="outline">Sold out</Badge>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {product.category && (
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
            {product.category.name}
          </span>
        )}

        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-1.5 line-clamp-2 text-base font-semibold leading-snug tracking-tight text-ink-900 transition-colors group-hover:text-indigo-700">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-500">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-ink-700">{product.rating.toFixed(1)}</span>
          <span>({product.reviewCount} reviews)</span>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-500">
          {product.description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-lg font-bold tracking-tight text-ink-900">
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
            disabled={soldOut}
            onClick={() => addItem(product)}
            aria-label={`Add ${product.name} to cart`}
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
