'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Search, ShoppingBag, Sparkles, User2, X } from 'lucide-react';
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

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled ? 'glass shadow-soft' : 'bg-transparent',
      )}
    >
      <div className="container-page flex h-[4.5rem] items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <motion.span
            whileHover={{ rotate: 12, scale: 1.06 }}
            className="relative grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600 text-white shadow-soft"
          >
            <Sparkles className="h-5 w-5" />
            <span className="absolute -inset-1 -z-10 rounded-3xl bg-indigo-500/30 blur-md transition-opacity group-hover:opacity-100 opacity-0" />
          </motion.span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight text-ink-900">Aurora</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-500">
              Commerce
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
                  active ? 'text-indigo-700' : 'text-ink-600 hover:text-indigo-700',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-full bg-indigo-50"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            aria-label="Search"
            className="hidden h-10 w-10 place-items-center rounded-full text-ink-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700 sm:grid"
          >
            <Search className="h-[18px] w-[18px]" />
          </motion.button>

          <Link
            href={user ? '/account' : '/login'}
            aria-label={user ? 'Your account' : 'Sign in'}
            className="grid h-10 w-10 place-items-center rounded-full text-ink-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
          >
            <User2 className="h-[18px] w-[18px]" />
          </Link>

          <button
            onClick={openCart}
            aria-label={`Cart with ${count} items`}
            className="relative grid h-10 w-10 place-items-center rounded-full text-ink-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <Button href="/products" size="sm" className="hidden sm:inline-flex">
            Shop now
          </Button>

          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation"
            className="grid h-10 w-10 place-items-center rounded-full text-ink-700 md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-ink-100 bg-white/95 backdrop-blur-xl md:hidden"
          >
            <div className="container-page flex flex-col gap-1 py-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-ink-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;
