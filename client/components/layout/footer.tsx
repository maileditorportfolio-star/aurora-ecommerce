'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Facebook, Github, Instagram, Twitter } from 'lucide-react';

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

const socials = [
  { label: 'Twitter', icon: Twitter },
  { label: 'Instagram', icon: Instagram },
  { label: 'Facebook', icon: Facebook },
  { label: 'GitHub', icon: Github },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const subscribe = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribed(true);
  };

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-white/10 bg-ink-950 text-white">
      <div aria-hidden className="absolute inset-0 bg-aurora-deep opacity-55" />
      <div
        aria-hidden
        className="absolute inset-0 bg-grid-fine bg-[length:32px_32px] opacity-20 [mask-image:radial-gradient(70%_70%_at_50%_0%,black,transparent)]"
      />

      <div className="container-page relative py-16">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_1.75fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3"
            >
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-plasma-600 shadow-glow">
                <span className="text-lg font-bold text-white">A</span>
              </span>
              <div className="leading-none">
                <p className="text-lg font-bold tracking-tight">Aurora</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-signal-300/80">
                  Cyber
                </p>
              </div>
            </motion.div>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-300">
              A modern storefront platform built for Aurora Cyber. Curated tech, honest pricing and
              delivery you can track from checkout to doorstep.
            </p>

            <form onSubmit={subscribe} className="mt-8 max-w-sm">
              <label
                htmlFor="newsletter-email"
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400"
              >
                The drop list
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 pl-4 backdrop-blur">
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setSubscribed(false);
                  }}
                  placeholder="you@example.com"
                  className="h-9 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-ink-500"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to the drop list"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-signal-300 text-ink-950 transition-transform hover:scale-105"
                >
                  {subscribed ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-2 min-h-4 text-xs text-ink-400">
                {subscribed
                  ? "You're on the list. Watch your inbox."
                  : 'One short email when new gear lands.'}
              </p>
            </form>

            <div className="mt-6 flex gap-2">
              {socials.map(({ label, icon: Icon }) => (
                <motion.a
                  key={label}
                  href="#"
                  whileHover={{ y: -3 }}
                  aria-label={label}
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
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-signal-300/80">
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
