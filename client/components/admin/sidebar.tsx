'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Boxes,
  ChartNoAxesColumn,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { cn, initials } from '@/lib/utils';

const navigation = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/products', label: 'Products', icon: Boxes },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: ChartNoAxesColumn },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const isActive = (item: (typeof navigation)[number]) =>
    item.exact ? pathname === item.href : pathname?.startsWith(item.href);

  const content = (
    <div className="flex h-full flex-col bg-ink-950 text-white">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600">
          <Sparkles className="h-5 w-5" />
        </span>
        <span className="flex flex-col leading-none">
          <span className="text-base font-bold tracking-tight">Aurora</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-400">
            Console
          </span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4">
        {navigation.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                'relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                active ? 'text-white' : 'text-ink-400 hover:bg-white/5 hover:text-white',
              )}
            >
              {active && (
                <motion.span
                  layoutId="admin-active"
                  className="absolute inset-0 -z-10 rounded-2xl bg-indigo-600/20 ring-1 ring-indigo-500/40"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}

        <Link
          href="/"
          className="mt-2 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-ink-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <Package className="h-[18px] w-[18px]" />
          View storefront
        </Link>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-2xl px-3 py-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-200">
            {initials(user?.name ?? 'Admin')}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.name ?? 'Administrator'}</p>
            <p className="truncate text-xs text-ink-400">{user?.email ?? ''}</p>
          </div>
          <button
            onClick={() => logout()}
            aria-label="Sign out"
            className="text-ink-400 transition-colors hover:text-rose-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-72">{content}</div>
      </aside>

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-ink-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <span className="flex items-center gap-2 text-sm font-bold text-ink-900">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-600 text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          Aurora Console
        </span>
        <button
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle admin navigation"
          className="grid h-10 w-10 place-items-center rounded-xl text-ink-700 transition-colors hover:bg-ink-100"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-ink-950/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default AdminSidebar;
