'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Minus, Plus, ShoppingBag, Star, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCartStore } from '@/store/cart';
import { api } from '@/lib/api';
import { cn, discountPercent, formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

const highlights = [
  '12-month brand warranty',
  'Free delivery over ৳5,000',
  'Cash on delivery available',
  '7-day easy replacement',
];

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.products
      .detail(slug)
      .then(({ product: found, related: relatedProducts }) => {
        setProduct(found);
        setRelated(relatedProducts);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container-page grid gap-12 py-16 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-[2rem]" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-14 w-40 rounded-full" />
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="container-page flex flex-col items-center gap-5 py-28 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">Product not found</h1>
        <p className="text-sm text-ink-500">This product may have been archived or renamed.</p>
        <Button href="/products">Back to catalogue</Button>
      </div>
    );
  }

  const discount = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.stock <= 0;

  return (
    <div className="container-page py-12 sm:py-16">
      <nav className="flex items-center gap-2 text-xs text-ink-400">
        <Link href="/" className="hover:text-indigo-600">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-indigo-600">
          Products
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-indigo-600"
            >
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-100 via-white to-sky-100 shadow-soft"
        >
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <motion.img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8 }}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-indigo-200 via-indigo-300 to-sky-300" />
          )}

          <div className="absolute left-5 top-5 flex flex-col gap-2">
            {product.featured && <Badge variant="indigo">Featured</Badge>}
            {discount > 0 && <Badge variant="danger">-{discount}% off</Badge>}
            {soldOut && <Badge variant="outline">Sold out</Badge>}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col"
        >
          {product.category && (
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
              {product.category.name}
            </span>
          )}

          <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4].map((index) => (
                <Star
                  key={index}
                  className={cn(
                    'h-4 w-4',
                    index < Math.round(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-ink-200',
                  )}
                />
              ))}
              <span className="ml-1 text-sm font-semibold text-ink-700">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-sm text-ink-400">({product.reviewCount} reviews)</span>
            </div>
            <span className="h-4 w-px bg-ink-200" />
            <span className="flex items-center gap-1.5 text-sm text-ink-500">
              <Truck className="h-4 w-4 text-indigo-500" />
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <p className="mt-6 text-base leading-relaxed text-ink-500">{product.description}</p>

          <div className="mt-8 flex flex-wrap items-end gap-4">
            <span className="text-3xl font-bold tracking-tight text-ink-900">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-lg text-ink-400 line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1 rounded-full border border-ink-200 p-1">
              <button
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                aria-label="Decrease quantity"
                className="grid h-9 w-9 place-items-center rounded-full text-ink-600 transition-colors hover:bg-ink-100"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-semibold text-ink-900">{quantity}</span>
              <button
                onClick={() => setQuantity((value) => Math.min(product.stock || 1, value + 1))}
                aria-label="Increase quantity"
                className="grid h-9 w-9 place-items-center rounded-full text-ink-600 transition-colors hover:bg-ink-100"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              size="lg"
              disabled={soldOut}
              onClick={() => {
                addItem(product, quantity);
                setAdded(true);
                setTimeout(() => setAdded(false), 2000);
              }}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" /> Added to cart
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" /> {soldOut ? 'Sold out' : 'Add to cart'}
                </>
              )}
            </Button>

            <Button href="/cart" size="lg" variant="outline">
              View cart
            </Button>
          </div>

          <ul className="mt-10 grid gap-3 border-t border-ink-100 pt-8 sm:grid-cols-2">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-ink-600">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="h-3 w-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="text-2xl font-bold tracking-tight text-ink-900">You may also like</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Link
                  href={`/products/${item.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition-shadow hover:shadow-card"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-ink-100">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-indigo-200 to-sky-300" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-1 text-sm font-semibold text-ink-900">{item.name}</p>
                    <p className="mt-1 text-sm font-bold text-indigo-700">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
