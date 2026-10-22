'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, Boxes, DollarSign, ShoppingCart, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
interface Stats {
  totals: {
    revenue: number;
    pipeline: number;
    orders: number;
    products: number;
    customers: number;
    categories: number;
    averageOrder: number;
  };
  revenueByMonth: Array<{ month: string; revenue: number; orders: number }>;
  statusCounts: Array<{ status: string; count: number }>;
  topProducts: Array<{ name: string; units: number }>;
  lowStock: Array<{ id: string; name: string; stock: number }>;
}

const PIE_COLORS = ['#6366f1', '#38bdf8', '#a855f7', '#10b981', '#f59e0b', '#f43f5e'];

const cards = [
  {
    key: 'revenue',
    label: 'Revenue',
    icon: DollarSign,
    accent: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  { key: 'orders', label: 'Orders', icon: ShoppingCart, accent: 'text-sky-600', bg: 'bg-sky-50' },
  {
    key: 'products',
    label: 'Products',
    icon: Boxes,
    accent: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    key: 'customers',
    label: 'Customers',
    icon: Users,
    accent: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
] as const;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin
      .stats()
      .then((data) => setStats(data))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink-900">Dashboard</h1>
          <p className="mt-1.5 text-sm text-ink-500">
            Live performance across the last six months.
          </p>
        </div>
        {stats && (
          <p className="rounded-full bg-white px-4 py-2 text-xs font-medium text-ink-600 shadow-soft">
            Pipeline value {formatCurrency(stats.totals.pipeline)}
          </p>
        )}
      </motion.header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          const value = stats?.totals[card.key];

          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              whileHover={{ y: -4 }}
              className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft"
            >
              <div className="flex items-start justify-between">
                <span
                  className={`grid h-11 w-11 place-items-center rounded-2xl ${card.bg} ${card.accent}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {card.key === 'revenue' && stats && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                    avg {formatCurrency(stats.totals.averageOrder)}
                  </span>
                )}
              </div>
              <p className="mt-5 text-2xl font-bold tracking-tight text-ink-900">
                {loading ? '—' : card.key === 'revenue' ? formatCurrency(value ?? 0) : (value ?? 0)}
              </p>
              <p className="mt-1 text-sm text-ink-500">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft"
        >
          <h2 className="text-lg font-semibold tracking-tight text-ink-900">Revenue trend</h2>
          <p className="mt-1 text-sm text-ink-500">Delivered order value per month.</p>

          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats?.revenueByMonth ?? []}
                margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 12px 30px -18px rgb(15 23 42 / 0.5)',
                    fontSize: 12,
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fill="url(#revenueFill)"
                  animationDuration={900}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft"
        >
          <h2 className="text-lg font-semibold tracking-tight text-ink-900">Orders by status</h2>
          <p className="mt-1 text-sm text-ink-500">Where the pipeline stands right now.</p>

          <div className="mt-6 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.statusCounts ?? []}
                  dataKey="count"
                  nameKey="status"
                  innerRadius="58%"
                  outerRadius="86%"
                  paddingAngle={3}
                  animationDuration={900}
                >
                  {(stats?.statusCounts ?? []).map((entry, index) => (
                    <Cell key={entry.status} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft"
        >
          <h2 className="text-lg font-semibold tracking-tight text-ink-900">Top products</h2>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.topProducts ?? []}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <Tooltip
                  cursor={{ fill: 'rgb(99 102 241 / 0.06)' }}
                  contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="units" fill="#4f46e5" radius={[0, 8, 8, 0]} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold tracking-tight text-ink-900">Low stock</h2>
          </div>
          <p className="mt-1 text-sm text-ink-500">Five units or fewer — restock soon.</p>

          {stats?.lowStock?.length ? (
            <ul className="mt-6 flex flex-col gap-3">
              {stats.lowStock.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between rounded-2xl border border-ink-100 px-4 py-3"
                >
                  <span className="truncate text-sm font-medium text-ink-700">{product.name}</span>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    {product.stock} left
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-8 rounded-2xl border border-dashed border-ink-200 p-8 text-center text-sm text-ink-500">
              {loading ? 'Loading…' : 'Everything is comfortably in stock.'}
            </p>
          )}
        </motion.section>
      </div>
    </div>
  );
}
