'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AtSign, Lock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch {
      /* error surfaced from the store */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-aurora opacity-50" />

      <div className="container-page relative flex min-h-[80vh] items-center justify-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md rounded-[2rem] border border-white/60 bg-white/85 p-8 shadow-card backdrop-blur-xl"
        >
          <div className="text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-white shadow-soft">
              <LogIn className="h-5 w-5" />
            </span>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink-900">Welcome back</h1>
            <p className="mt-2 text-sm text-ink-500">
              Sign in to track orders, check out faster and message support.
            </p>
          </div>

          <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
            <Input
              label="Email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => {
                clearError();
                setEmail(event.target.value);
              }}
              placeholder="you@example.com"
              icon={<AtSign className="h-4 w-4" />}
            />

            <Input
              label="Password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                clearError();
                setPassword(event.target.value);
              }}
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
            />

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700"
              >
                {error}
              </motion.p>
            )}

            <Button type="submit" size="lg" loading={loading}>
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            New to Aurora?{' '}
            <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Create an account
            </Link>
          </p>

          <div className="mt-6 rounded-2xl bg-ink-50 p-4 text-xs text-ink-500">
            <p className="font-semibold text-ink-700">Demo accounts</p>
            <p className="mt-1">Customer: customer@aurora.com / aurora123</p>
            <p>Admin: admin@aurora.com / aurora123</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
