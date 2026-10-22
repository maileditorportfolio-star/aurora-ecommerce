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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api, type AdminStats } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#6366f1', '#38bdf8', '#a855f7', '#10b981', '#f59e0b', '#f43f5e'];

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin
      .stats()
      .then(setStats)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">Analytics</h1>
        <p className="mt-1.5 text-sm text-ink-500">Six-month performance, broken down.</p>
      </motion.header>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft"
      >
        <h2 className="text-lg font-semibold tracking-tight text-ink-900">Monthly revenue</h2>
        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.revenueByMonth ?? []} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#4f46e5"
                strokeWidth={2.5}
                fill="url(#analyticsFill)"
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft"
        >
          <h2 className="text-lg font-semibold tracking-tight text-ink-900">Orders per month</h2>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.revenueByMonth ?? []} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgb(99 102 241 / 0.06)' }}
                  contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="orders" radius={[8, 8, 0, 0]} animationDuration={900}>
                  {(stats?.revenueByMonth ?? []).map((entry, index) => (
                    <Cell key={entry.month} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft"
        >
          <h2 className="text-lg font-semibold tracking-tight text-ink-900">Units sold</h2>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.topProducts ?? []}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
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
                <Bar dataKey="units" fill="#38bdf8" radius={[0, 8, 8, 0]} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26 }}
        className="overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft"
      >
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-100 text-xs uppercase tracking-wider text-ink-400">
            <tr>
              <th className="px-6 py-3 font-semibold">Month</th>
              <th className="px-6 py-3 font-semibold">Orders</th>
              <th className="px-6 py-3 text-right font-semibold">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {(stats?.revenueByMonth ?? []).map((row) => (
              <tr key={row.month} className="border-b border-ink-50 last:border-0">
                <td className="px-6 py-3 font-medium text-ink-700">{row.month}</td>
                <td className="px-6 py-3 text-ink-500">{row.orders}</td>
                <td className="px-6 py-3 text-right font-semibold text-ink-900">
                  {loading ? '—' : formatCurrency(row.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
