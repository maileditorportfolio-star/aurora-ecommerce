'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, type AdminCustomer } from '@/lib/api';
import { formatCurrency, formatDate, initials } from '@/lib/utils';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      api.admin
        .customers({ search: search || undefined })
        .then(({ customers: list }) => setCustomers(list))
        .catch(() => setCustomers([]))
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="flex flex-col gap-8">
      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">Customers</h1>
        <p className="mt-1.5 text-sm text-ink-500">
          {loading ? 'Loading customers…' : `${customers.length} registered customer(s)`}
        </p>
      </motion.header>

      <div className="relative sm:max-w-xs">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, email or phone…"
          className="h-11 w-full rounded-full border border-ink-200 bg-white pl-11 pr-4 text-sm outline-none transition-shadow focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
        />
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-20 animate-pulse rounded-3xl bg-ink-100" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-ink-200 bg-white p-16 text-center">
          <Users className="mx-auto h-8 w-8 text-ink-300" />
          <p className="mt-4 text-sm font-medium text-ink-700">No customers found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft">
          <div className="hidden grid-cols-[1.6fr_1.4fr_0.7fr_0.7fr_0.8fr] gap-4 border-b border-ink-100 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400 md:grid">
            <span>Customer</span>
            <span>Contact</span>
            <span>Orders</span>
            <span>Value</span>
            <span>Joined</span>
          </div>

          {customers.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.3) }}
              className="grid grid-cols-1 gap-3 border-b border-ink-50 px-6 py-4 last:border-0 md:grid-cols-[1.6fr_1.4fr_0.7fr_0.7fr_0.8fr] md:items-center md:gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
                  {initials(customer.name)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink-900">
                    {customer.name}
                  </span>
                  <span className="block truncate text-xs text-ink-400">{customer.email}</span>
                </span>
              </div>

              <span className="truncate text-sm text-ink-500">{customer.phone || '—'}</span>

              <span className="text-sm font-semibold text-ink-900">{customer.orderCount}</span>

              <span className="text-sm font-semibold text-indigo-700">
                {formatCurrency(customer.lifetimeValue)}
              </span>

              <span className="text-xs text-ink-400">{formatDate(customer.createdAt)}</span>
            </motion.div>
          ))}
        </div>
      )}

      <div>
        <Button variant="ghost" size="sm" onClick={() => setSearch('')}>
          Reset search
        </Button>
      </div>
    </div>
  );
}
