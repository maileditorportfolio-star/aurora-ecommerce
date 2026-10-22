'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AtSign, Lock, Phone, UserPlus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    clearError();
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await register(form);
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
              <UserPlus className="h-5 w-5" />
            </span>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink-900">Create your account</h1>
            <p className="mt-2 text-sm text-ink-500">
              One account for faster checkout, order tracking and support chat.
            </p>
          </div>

          <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
            <Input
              label="Full name"
              required
              autoComplete="name"
              value={form.name}
              onChange={update('name')}
              placeholder="Nafis Hasan"
              icon={<User className="h-4 w-4" />}
            />

            <Input
              label="Email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={update('email')}
              placeholder="you@example.com"
              icon={<AtSign className="h-4 w-4" />}
            />

            <Input
              label="Phone (optional)"
              value={form.phone}
              onChange={update('phone')}
              placeholder="+8801XXXXXXXXX"
              icon={<Phone className="h-4 w-4" />}
            />

            <Input
              label="Password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={update('password')}
              placeholder="At least 8 characters"
              icon={<Lock className="h-4 w-4" />}
              hint="Use 8+ characters with a mix of letters and numbers."
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
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Already registered?{' '}
            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
