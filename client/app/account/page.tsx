'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, Package, ShoppingBag, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import type { Order } from '@/types';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-indigo-100 text-indigo-700',
  PROCESSING: 'bg-sky-100 text-sky-700',
  SHIPPED: 'bg-violet-100 text-violet-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
};

const timeline: Array<{ key: string; label: string; icon: typeof Package }> = [
  { key: 'CONFIRMED', label: 'Confirmed', icon: Package },
  { key: 'PROCESSING', label: 'Processing', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: ShoppingBag },
];

export default function AccountPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.orders
      .mine()
      .then(({ orders: list }) => setOrders(list))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user && !loading) router.replace('/login');
  }, [user, loading, router]);

  const steps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

  return (
    <div className="container-page py-12 sm:py-16">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Hello, {user?.name?.split(' ')[0] ?? 'there'}
          </h1>
          <p className="mt-2 text-sm text-ink-500">{user?.email}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            logout();
            router.push('/');
          }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </motion.header>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight text-ink-900">Your orders</h2>

        {loading ? (
          <div className="mt-6 flex flex-col gap-4">
            {[0, 1].map((index) => (
              <div key={index} className="h-40 animate-pulse rounded-3xl bg-ink-100" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-ink-200 bg-white p-16 text-center">
            <p className="text-sm font-medium text-ink-700">No orders yet</p>
            <p className="mt-1 text-sm text-ink-500">Your first purchase will show up here.</p>
            <Button href="/products" className="mt-5" size="sm">
              Browse products
            </Button>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-5">
            {orders.map((order, index) => {
              const currentIndex = steps.indexOf(order.status);

              return (
                <motion.article
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.07 }}
                  className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{order.orderNumber}</p>
                      <p className="text-xs text-ink-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={cn('px-3 py-1', statusStyles[order.status])}>
                        {order.status}
                      </Badge>
                      <span className="text-lg font-bold text-ink-900">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>

                  {order.status !== 'CANCELLED' && (
                    <div className="mt-6 flex items-center gap-1">
                      {timeline.map((step, stepIndex) => {
                        const Icon = step.icon;
                        const reached = stepIndex <= currentIndex;
                        return (
                          <div key={step.key} className="flex flex-1 items-center gap-1">
                            <span
                              className={cn(
                                'grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors',
                                reached ? 'bg-indigo-600 text-white' : 'bg-ink-100 text-ink-400',
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <span
                              className={cn(
                                'hidden text-[11px] font-medium sm:block',
                                reached ? 'text-indigo-700' : 'text-ink-400',
                              )}
                            >
                              {step.label}
                            </span>
                            {stepIndex < timeline.length - 1 && (
                              <span
                                className={cn(
                                  'h-0.5 flex-1 rounded-full',
                                  stepIndex < currentIndex ? 'bg-indigo-500' : 'bg-ink-100',
                                )}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <ul className="mt-6 flex flex-col gap-2 border-t border-ink-100 pt-4">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-ink-600">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="font-semibold text-ink-900">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      <p className="mt-12 text-center text-sm text-ink-500">
        Looking for the admin console?{' '}
        <Link href="/admin" className="font-semibold text-indigo-600 hover:text-indigo-700">
          Open it here
        </Link>
        .
      </p>
    </div>
  );
}
