'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Menu, Search, ShoppingBag, Sparkles, User2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

const links = [
  { href: '/products', label: 'Shop' },
  { href: '/#categories', label: 'Categories' },
  { href: '/#features', label: 'Why Aurora' },
  { href: '/admin', label: 'Admin' },
];

const assurances = ['24h dispatch', '12-month warranty', '7-day returns'];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const items = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.open);
  const user = useAuthStore((state) => state.user);

  const count = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="relative z-40 border-b border-white/5 bg-ink-950 text-white">
        <div className="container-page flex h-9 items-center justify-between gap-4 text-[11px] font-medium tracking-wide text-ink-300">
          <p className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-300 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal-300" />
            </span>
            Free delivery over ৳5,000
          </p>
          <div className="hidden items-center gap-5 sm:flex">
            {assurances.map((item, index) => (
              <span key={item} className="flex items-center gap-5">
                {index > 0 && <span className="h-3 w-px bg-white/15" />}
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b border-white/5 bg-ink-950/85 backdrop-blur-xl transition-all duration-300',
          scrolled && 'glass glass-dark shadow-lift',
        )}
      >
        <div className="container-page flex h-[4.5rem] items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-2.5">
            <motion.span
              whileHover={{ rotate: 10, scale: 1.06 }}
              transition={{ type: 'spring', stiffness: 360, damping: 20 }}
              className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-plasma-600 text-white shadow-glow"
            >
              <Sparkles className="h-5 w-5" />
              <span className="absolute -inset-1 -z-10 rounded-3xl bg-indigo-500/40 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
            </motion.span>
            <span className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-tight text-white">Aurora</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-signal-300/80">
                Cyber
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    active ? 'text-white' : 'text-ink-300 hover:text-white',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-full bg-white/10 ring-1 ring-white/10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link
              href="/products"
              aria-label="Search products"
              className="hidden h-10 w-10 place-items-center rounded-full text-ink-300 transition-colors hover:bg-white/10 hover:text-white sm:grid"
            >
              <Search className="h-[18px] w-[18px]" />
            </Link>

            <Link
              href={user ? '/account' : '/login'}
              aria-label={user ? 'Your account' : 'Sign in'}
              className="grid h-10 w-10 place-items-center rounded-full text-ink-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <User2 className="h-[18px] w-[18px]" />
            </Link>

            <button
              onClick={openCart}
              aria-label={`Cart with ${count} items`}
              className="relative grid h-10 w-10 place-items-center rounded-full text-ink-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-signal-300 px-1 text-[10px] font-bold text-ink-950"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <div className="ml-1 hidden sm:block">
              <Button href="/products" size="sm" variant="signal">
                Shop now
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>

            <button
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              className="grid h-10 w-10 place-items-center rounded-full text-white transition-colors hover:bg-white/10 md:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              id="mobile-navigation"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-white/10 bg-ink-950/95 backdrop-blur-xl md:hidden"
            >
              <div className="container-page flex flex-col gap-1 py-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-ink-200 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

export default Header;
