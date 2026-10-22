'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Hero } from '@/components/home/hero';
import { ProductGrid } from '@/components/product/product-grid';
import { SkeletonList } from '@/components/ui/skeleton';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { Product } from '@/types';

const features = [
  {
    title: 'Real stock, real fast',
    body: 'Every listing maps to live inventory so what you see is what ships. No ghost orders, no back-order roulette.',
  },
  {
    title: 'Transparent pricing',
    body: 'One price, taxes and delivery shown up front. No surprise fees revealed at the last checkout step.',
  },
  {
    title: 'Support that answers',
    body: 'Live chat with a human agent, tracked order status and a 12-month warranty on every unit we ship.',
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api.products
      .list({ featured: true, limit: 6 })
      .then(({ items }) => {
        if (active) setProducts(items);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Hero />

      <section id="features" className="relative py-20 sm:py-28">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-700">
              <Sparkles className="h-3.5 w-3.5" />
              Built for confidence
            </span>
            <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Shopping should feel effortless
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-500">
              We rebuilt the storefront around the three things shoppers actually care about.
            </p>
          </Reveal>

          <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <StaggerItem key={feature.title}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  className="group h-full rounded-3xl border border-ink-100 bg-white p-7 shadow-soft transition-shadow hover:shadow-card"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-lg font-bold text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-500">{feature.body}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section id="categories" className="bg-ink-50/70 py-20 sm:py-28">
        <div className="container-page">
          <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
                Featured drops
              </h2>
              <p className="mt-3 text-base text-ink-500">Hand-picked gear that ships this week.</p>
            </div>
            <Button href="/products" variant="outline">
              View all products
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Reveal>

          <div className="mt-12">
            {loading ? (
              <SkeletonList count={6} />
            ) : products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <div className="rounded-3xl border border-dashed border-ink-200 bg-white p-12 text-center">
                <p className="text-sm text-ink-500">
                  No products yet. Seed the database to see the catalogue come alive.
                </p>
                <Button href="/admin" className="mt-5" size="sm">
                  Open admin
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 sm:py-28">
        <div className="container-page">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-ink-950 px-8 py-14 text-center text-white sm:px-16">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-aurora opacity-60"
              />
              <div className="relative">
                <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                  Ready to upgrade your setup?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-300">
                  Talk to a real person about which configuration fits your workflow — we reply in
                  minutes, not days.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button href="/products" size="lg">
                    Start shopping
                  </Button>
                  <Link
                    href="/#contact"
                    className="inline-flex h-13 items-center rounded-full border border-white/20 px-7 text-base font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Chat with support
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
