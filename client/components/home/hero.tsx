'use client';

import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Headphones,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { discountPercent, formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

const stats = [
  { value: '4.8/5', label: 'Average rating' },
  { value: '24h', label: 'Dispatch window' },
  { value: '12mo', label: 'Brand warranty' },
  { value: '10k+', label: 'Orders shipped' },
];

const marqueeItems = [
  'Laptops',
  'Audio',
  'Displays',
  'Accessories',
  'Networking',
  'Free delivery over ৳5,000',
  '12-month warranty',
  '7-day returns',
];

export function Hero({ product }: { product?: Product }) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 520], [0, reduceMotion ? 0 : 80]);
  const discount = product ? discountPercent(product.price, product.compareAtPrice) : 0;

  return (
    <section className="relative overflow-hidden bg-ink-950 text-white">
      <div aria-hidden className="absolute inset-0 bg-aurora-deep" />
      <div
        aria-hidden
        className="absolute inset-0 bg-grid-fine bg-[length:32px_32px] opacity-40 [mask-image:radial-gradient(75%_65%_at_50%_0%,black,transparent)]"
      />
      <div
        aria-hidden
        className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-indigo-500/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="absolute -right-32 top-0 h-80 w-80 rounded-full bg-cyan-400/15 blur-[110px]"
      />

      <div className="container-page relative grid items-center gap-14 pb-16 pt-14 sm:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:pb-24">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-200 backdrop-blur"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-300 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal-300" />
            </span>
            Aurora Cyber / 2026 collection
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-xl text-balance text-5xl font-bold leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-7xl"
          >
            Tech that feels{' '}
            <span className="text-gradient-light animate-gradient-pan">effortless</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-lg text-base leading-relaxed text-ink-300 sm:text-lg"
          >
            A tightly curated shelf of laptops, audio, displays and desk gear. Honest pricing, live
            stock and delivery you can track from checkout to doorstep.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button href="/products" size="lg" variant="signal">
              Explore the catalogue
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/#features" size="lg" variant="outlineLight">
              Why Aurora
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 grid max-w-lg grid-cols-2 gap-x-8 gap-y-5 border-t border-white/10 pt-7 sm:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-xl font-semibold tracking-tight text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-ink-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-ink-300"
          >
            {[
              { icon: Truck, label: 'Free delivery over ৳5,000' },
              { icon: ShieldCheck, label: '12-month warranty' },
              { icon: Headphones, label: 'Live human support' },
              { icon: BadgeCheck, label: '100% authentic stock' },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-signal-300" />
                {label}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          style={{ y }}
          initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.85, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-full max-w-md"
        >
          <div
            aria-hidden
            className="absolute -inset-6 rounded-[3rem] bg-aurora opacity-70 blur-2xl"
          />
          <Link
            href={product ? `/products/${product.slug}` : '/products'}
            className="group relative block overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/[0.045] p-3 shadow-lift backdrop-blur-xl transition-colors hover:border-white/20"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-ink-900">
              {product?.imageUrl ? (
                <motion.img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  initial={{ scale: 1.06 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gradient-to-br from-indigo-600 via-indigo-800 to-ink-950">
                  <div className="text-center">
                    <Sparkles className="mx-auto h-10 w-10 text-signal-300" />
                    <p className="mt-3 text-xs uppercase tracking-[0.24em] text-ink-300">
                      Curating the drop
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />

              <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-ink-950/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-signal-300" />
                  In stock
                </span>
                {discount > 0 && (
                  <span className="rounded-full bg-signal-300 px-3 py-1 text-[10px] font-bold text-ink-950">
                    -{discount}%
                  </span>
                )}
              </div>

              <div className="absolute inset-x-4 bottom-4">
                <div className="rounded-2xl border border-white/10 bg-ink-950/55 p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-400">
                        {product?.category?.name ?? 'Featured drop'}
                      </p>
                      <p className="mt-1 truncate font-display text-lg font-semibold tracking-tight text-white">
                        {product?.name ?? 'Aurora Pro 14 Ultrabook'}
                      </p>
                    </div>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-signal-300 text-ink-950 transition-transform group-hover:-translate-y-0.5">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>

                  {product && (
                    <div className="mt-3 flex items-end justify-between gap-4 border-t border-white/10 pt-3">
                      <div>
                        <p className="text-xl font-bold tracking-tight text-white">
                          {formatCurrency(product.price)}
                        </p>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <p className="text-xs text-ink-400 line-through">
                            {formatCurrency(product.compareAtPrice)}
                          </p>
                        )}
                      </div>
                      <p className="text-right text-[11px] text-ink-400">
                        {product.rating.toFixed(1)} rating
                        <br />
                        {product.reviewCount} reviews
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      <div className="relative border-t border-white/10 py-4">
        <div className="flex w-max animate-marquee-slow items-center gap-10 whitespace-nowrap pr-10 text-[10px] font-semibold uppercase tracking-[0.3em] text-ink-400">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span key={`${item}-${index}`} className="flex items-center gap-10">
              {item}
              <span className="h-1 w-1 rounded-full bg-signal-300/70" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
