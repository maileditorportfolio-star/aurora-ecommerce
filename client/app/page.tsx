'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Cable,
  Headphones,
  Laptop,
  Monitor,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { Hero } from '@/components/home/hero';
import { ProductGrid } from '@/components/product/product-grid';
import { SkeletonList } from '@/components/ui/skeleton';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { useStorefrontSettings } from '@/components/providers/storefront-settings';
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

const categoryTiles = [
  {
    name: 'Laptops',
    slug: 'laptops',
    icon: Laptop,
    blurb: 'Portable power',
    tint: 'from-indigo-500/15 via-white to-cyan-400/10',
  },
  {
    name: 'Audio',
    slug: 'audio',
    icon: Headphones,
    blurb: 'Studio to street',
    tint: 'from-plasma-500/15 via-white to-indigo-400/10',
  },
  {
    name: 'Displays',
    slug: 'displays',
    icon: Monitor,
    blurb: 'More canvas',
    tint: 'from-cyan-400/15 via-white to-indigo-400/10',
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    icon: Cable,
    blurb: 'Desk essentials',
    tint: 'from-signal-300/20 via-white to-cyan-300/10',
  },
  {
    name: 'Networking',
    slug: 'networking',
    icon: Wifi,
    blurb: 'Stay connected',
    tint: 'from-indigo-400/15 via-white to-plasma-400/10',
  },
];

export default function HomePage() {
  const settings = useStorefrontSettings();
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
      <Hero
        product={
          products.find((product) => product.slug === settings.heroProductSlug) ??
          products.find((product) => product.slug === 'aurora-pro-14-ultrabook') ??
          products[0]
        }
      />

      <section
        id="features"
        className={`relative bg-frost py-20 sm:py-28 ${settings.showFeatures ? '' : 'hidden'}`}
      >
        <div className="container-page grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-600">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              Built for confidence
            </span>
            <h2 className="mt-5 max-w-md text-balance text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-ink-900 sm:text-4xl">
              Shopping should feel effortless
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-500">
              We rebuilt the storefront around the three things shoppers actually care about.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-600 shadow-soft">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Every order is tracked end to end
            </div>
          </Reveal>

          <Stagger className="flex flex-col">
            {features.map((feature, index) => (
              <StaggerItem key={feature.title}>
                <motion.div
                  whileHover={{ x: 6 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                  className="group grid gap-3 border-t border-ink-200 py-7 sm:grid-cols-[3.5rem_1fr_auto] sm:items-start sm:gap-6"
                >
                  <span className="font-display text-sm font-semibold tracking-[0.18em] text-ink-400">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-ink-900">
                      {feature.title}
                    </h3>
                    <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-ink-500">
                      {feature.body}
                    </p>
                  </div>
                  <ArrowUpRight className="hidden h-5 w-5 text-ink-300 transition-colors group-hover:text-indigo-600 sm:block" />
                </motion.div>
              </StaggerItem>
            ))}
            <div className="border-t border-ink-200" />
          </Stagger>
        </div>
      </section>

      <section
        id="categories"
        className={`bg-white py-20 sm:py-24 ${settings.showCategories ? '' : 'hidden'}`}
      >
        <div className="container-page">
          <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600">
                Find your lane
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-ink-900 sm:text-4xl">
                Shop by discipline
              </h2>
            </div>
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-ink-600 transition-colors hover:text-indigo-700"
            >
              Browse everything
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>

          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {categoryTiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <StaggerItem key={tile.slug}>
                  <Link
                    href={`/products?category=${tile.slug}`}
                    className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-ink-200/70 bg-gradient-to-br ${tile.tint} p-5 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-card`}
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/70 bg-white/80 text-ink-700 shadow-soft backdrop-blur">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="mt-10">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-500">
                        {tile.blurb}
                      </p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <h3 className="font-display text-lg font-semibold tracking-tight text-ink-900">
                          {tile.name}
                        </h3>
                        <ArrowUpRight className="h-4 w-4 text-ink-400 transition-all group-hover:-translate-y-0.5 group-hover:text-indigo-600" />
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      <section id="drops" className="border-y border-ink-200/70 bg-frost py-20 sm:py-24">
        <div className="container-page">
          <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600">
                This week
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-ink-900 sm:text-4xl">
                Featured drops
              </h2>
              <p className="mt-3 text-base text-ink-500">Hand-picked gear that ships this week.</p>
            </div>
            <Button href="/products" variant="outline">
              View all products
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Reveal>

          <div className="mt-10">
            {loading ? (
              <SkeletonList count={6} />
            ) : products.length > 0 ? (
              <ProductGrid products={products}>
                <Link
                  href="/products"
                  className="group relative flex min-h-[240px] flex-col items-start justify-center overflow-hidden rounded-[1.75rem] bg-ink-950 p-8 text-white shadow-card sm:col-span-2 lg:col-span-2"
                >
                  <div aria-hidden className="absolute inset-0 bg-aurora-deep opacity-80" />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-grid-fine bg-[length:32px_32px] opacity-30"
                  />
                  <span className="absolute left-8 top-7 text-[10px] font-semibold uppercase tracking-[0.2em] text-signal-300">
                    The full shelf
                  </span>
                  <span className="absolute right-7 top-6 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 transition-transform group-hover:-translate-y-0.5">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                  <div className="relative mt-8 max-w-md">
                    <p className="font-display text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
                      Every product, one standard.
                    </p>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-300">
                      Live stock, honest pricing and a 12-month warranty on every unit.
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
                      Browse the catalogue
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </ProductGrid>
            ) : (
              <div className="rounded-3xl border border-dashed border-ink-300 bg-white p-12 text-center">
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

      <section id="contact" className="bg-white py-20 sm:py-28">
        <div className="container-page">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-ink-950 px-8 py-16 text-center text-white sm:px-16">
              <div aria-hidden className="absolute inset-0 bg-aurora-deep opacity-80" />
              <div
                aria-hidden
                className="absolute inset-0 bg-grid-fine bg-[length:32px_32px] opacity-30 [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)]"
              />
              <div className="relative">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-signal-300">
                  Aurora Cyber
                </p>
                <h2 className="mx-auto mt-4 max-w-2xl text-balance text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                  Ready to upgrade your setup?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-300">
                  Talk to a real person about which configuration fits your workflow. We reply in
                  minutes, not days.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button href="/products" size="lg" variant="signal">
                    Start shopping
                  </Button>
                  <Link
                    href="/#contact"
                    className="inline-flex h-13 items-center rounded-full border border-white/15 bg-white/5 px-7 text-base font-medium text-white transition-colors hover:bg-white/10"
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
