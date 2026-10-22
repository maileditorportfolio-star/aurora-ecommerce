'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Package, RefreshCw, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import type { Order } from '@/types';

const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-indigo-100 text-indigo-700',
  PROCESSING: 'bg-sky-100 text-sky-700',
  SHIPPED: 'bg-violet-100 text-violet-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.orders
      .all({ search: search || undefined, status: status || undefined })
      .then(({ orders: list }) => setOrders(list))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(load, 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  const changeStatus = async (order: Order, next: string) => {
    setUpdating(order.orderNumber);
    try {
      const { order: updated } = await api.orders.updateStatus(order.orderNumber, next);
      setOrders((current) =>
        current.map((item) =>
          item.orderNumber === updated.orderNumber ? { ...item, status: updated.status } : item,
        ),
      );
    } catch {
      /* keep the previous state when the API rejects the change */
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink-900">Orders</h1>
          <p className="mt-1.5 text-sm text-ink-500">
            {loading ? 'Loading orders…' : `${orders.length} order(s) in view`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </motion.header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order number, name or email…"
            className="h-11 w-full rounded-full border border-ink-200 bg-white pl-11 pr-4 text-sm outline-none transition-shadow focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {statuses.map((item) => (
            <button
              key={item}
              onClick={() => setStatus(status === item ? '' : item)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                status === item
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-ink-200 bg-white text-ink-600 hover:border-indigo-300',
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-28 animate-pulse rounded-3xl bg-ink-100" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-ink-200 bg-white p-16 text-center">
          <Package className="mx-auto h-8 w-8 text-ink-300" />
          <p className="mt-4 text-sm font-medium text-ink-700">No orders found</p>
          <p className="mt-1 text-sm text-ink-500">Try a different filter or search term.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order, index) => (
            <motion.article
              key={order.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.3) }}
              className="rounded-3xl border border-ink-100 bg-white p-5 shadow-soft"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold tracking-tight text-ink-900">
                    {order.orderNumber}
                  </p>
                  <p className="mt-1 text-xs text-ink-400">
                    {formatDate(order.createdAt)} · {order.shippingName} · {order.shippingPhone}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-400">{order.shippingAddress}</p>
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

              <ul className="mt-4 flex flex-wrap gap-2 border-t border-ink-100 pt-4">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-full bg-ink-50 px-3 py-1.5 text-xs font-medium text-ink-600"
                  >
                    {item.name} × {item.quantity}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-ink-500">Set status:</span>
                <div className="relative">
                  <select
                    value={order.status}
                    disabled={updating === order.orderNumber}
                    onChange={(event) => changeStatus(order, event.target.value)}
                    className="h-9 appearance-none rounded-full border border-ink-200 bg-white pl-3.5 pr-9 text-xs font-semibold text-ink-700 outline-none transition-colors hover:border-indigo-300 disabled:opacity-50"
                  >
                    {statuses.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
                </div>
                <span className="text-xs text-ink-400">
                  Payment: {order.paymentMethod?.toUpperCase()} · {order.paymentStatus}
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
