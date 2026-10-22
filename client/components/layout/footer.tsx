'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Facebook, Github, Instagram, Twitter } from 'lucide-react';

const columns = [
  {
    title: 'Shop',
    links: [
      { label: 'All products', href: '/products' },
      { label: 'Laptops', href: '/products?category=laptops' },
      { label: 'Audio', href: '/products?category=audio' },
      { label: 'Displays', href: '/products?category=displays' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Aurora', href: '/#features' },
      { label: 'Your orders', href: '/account' },
      { label: 'Admin console', href: '/admin' },
      { label: 'Contact us', href: '/#contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Shipping & delivery', href: '/#features' },
      { label: 'Returns', href: '/#features' },
      { label: 'Live chat', href: '/#contact' },
      { label: 'FAQ', href: '/#features' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-ink-100 bg-ink-950 text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-aurora opacity-40" />

      <div className="container-page relative py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-lg font-bold tracking-tight"
            >
              Aurora <span className="text-indigo-400">Commerce</span>
            </motion.span>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-300">
              A modern storefront platform built for Aurora Cyber. Curated tech, honest pricing and
              delivery you can track from checkout to doorstep.
            </p>

            <div className="mt-6 flex gap-2">
              {[Twitter, Instagram, Facebook, Github].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  whileHover={{ y: -3 }}
                  aria-label="Social link"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-ink-300 transition-colors hover:border-indigo-400 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column, columnIndex) => (
              <motion.div
                key={column.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: columnIndex * 0.08 }}
              >
                <h3 className="text-sm font-semibold uppercase tracking-widest text-indigo-300">
                  {column.title}
                </h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-ink-300 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-ink-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Aurora Cyber. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
