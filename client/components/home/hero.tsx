'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, BadgeCheck, Headphones, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const assurances = [
  { icon: Truck, label: 'Free delivery over ৳5,000' },
  { icon: ShieldCheck, label: '12-month warranty' },
  { icon: Headphones, label: 'Live human support' },
  { icon: BadgeCheck, label: '100% authentic stock' },
];

export function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 400], [0, 90]);
  const opacity = useTransform(scrollY, [0, 320], [1, 0]);

  return (
    <section className="relative overflow-hidden bg-white pb-20 pt-14 sm:pt-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-aurora opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-indigo bg-grid opacity-60 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
      />

      <div className="container-page relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-xs font-semibold text-indigo-700 shadow-soft backdrop-blur"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            New season drop — up to 30% off
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl"
          >
            Tech that feels{' '}
            <span className="text-gradient animate-gradient-pan">effortless</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-lg text-base leading-relaxed text-ink-500 sm:text-lg"
          >
            Aurora Commerce curates laptops, audio, displays and desk gear with honest pricing, real
            stock and delivery you can track from checkout to doorstep.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.24 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button href="/products" size="lg">
              Explore the catalogue
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/#features" size="lg" variant="outline">
              Why Aurora
            </Button>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.36 }}
            className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4"
          >
            {assurances.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-xs font-medium text-ink-600">
                <Icon className="h-4 w-4 shrink-0 text-indigo-500" />
                {label}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          style={{ y, opacity }}
          initial={{ opacity: 0, scale: 0.92, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-100 via-white to-sky-100 shadow-card">
            <div className="absolute inset-6 rounded-[2rem] bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-900" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="relative h-40 w-40 rounded-[2.5rem] border border-white/25 bg-white/10 backdrop-blur-xl">
                <motion.div
                  className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-sky-400/40 to-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute inset-0 grid place-items-center text-center text-white">
                  <p className="text-5xl font-bold tracking-tight">24h</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.25em] text-indigo-100">Dispatch</p>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -24, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl border border-ink-100 bg-white/90 px-4 py-3 shadow-card backdrop-blur sm:-left-10"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-900">Free delivery</p>
              <p className="text-xs text-ink-500">On orders above ৳5,000</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
