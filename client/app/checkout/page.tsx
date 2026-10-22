'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, CreditCard, Landmark, Smartphone, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';

const paymentMethods = [
  { id: 'cod', label: 'Cash on delivery', icon: Wallet },
  { id: 'bkash', label: 'bKash', icon: Smartphone },
  { id: 'nagad', label: 'Nagad', icon: Smartphone },
  { id: 'card', label: 'Card', icon: CreditCard },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCartStore();
  const user = useAuthStore((state) => state.user);

  const [form, setForm] = useState({
    shippingName: user?.name ?? '',
    shippingPhone: user?.phone ?? '',
    shippingAddress: '',
    shippingCity: '',
    shippingZip: '',
    note: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const shipping = subtotal() >= 5000 ? 0 : 60;

  const update =
    (key: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { order } = await api.orders.create({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        shippingName: form.shippingName,
        shippingPhone: form.shippingPhone,
        shippingAddress: form.shippingAddress,
        shippingCity: form.shippingCity,
        shippingZip: form.shippingZip,
        shippingCountry: 'Bangladesh',
        paymentMethod,
        note: form.note,
      });

      setOrderNumber(order.orderNumber);
      clear();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (orderNumber) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        className="container-page flex max-w-xl flex-col items-center gap-6 py-28 text-center"
      >
        <span className="grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">Order confirmed</h1>
        <p className="text-sm text-ink-500">
          Your order number is <span className="font-semibold text-ink-900">{orderNumber}</span>. We
          will call you to confirm delivery details.
        </p>
        <div className="flex gap-3">
          <Button href="/account">Track my order</Button>
          <Button href="/products" variant="outline">
            Keep shopping
          </Button>
        </div>
      </motion.div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page flex flex-col items-center gap-5 py-28 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">Nothing to check out</h1>
        <p className="text-sm text-ink-500">Your cart is empty — add a product first.</p>
        <Button href="/products" onClick={() => router.push('/products')}>
          Browse products
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-page flex max-w-md flex-col items-center gap-5 py-28 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">Sign in to continue</h1>
        <p className="text-sm text-ink-500">
          We need an account so we can track your order and keep your delivery history.
        </p>
        <Button href="/login" onClick={() => router.push('/login')}>
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page py-12 sm:py-16">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold tracking-tight text-ink-900"
      >
        Checkout
      </motion.h1>

      <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-8">
          <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-ink-900">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                1
              </span>
              Delivery details
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Input
                label="Full name"
                required
                value={form.shippingName}
                onChange={update('shippingName')}
                placeholder="Nafis Hasan"
              />
              <Input
                label="Phone number"
                required
                value={form.shippingPhone}
                onChange={update('shippingPhone')}
                placeholder="+8801XXXXXXXXX"
              />
              <div className="sm:col-span-2">
                <Textarea
                  label="Address"
                  required
                  value={form.shippingAddress}
                  onChange={update('shippingAddress')}
                  placeholder="House, road, area"
                />
              </div>
              <Input
                label="City"
                value={form.shippingCity}
                onChange={update('shippingCity')}
                placeholder="Dhaka"
              />
              <Input
                label="Postal code"
                value={form.shippingZip}
                onChange={update('shippingZip')}
                placeholder="1207"
              />
              <div className="sm:col-span-2">
                <Textarea
                  label="Delivery notes (optional)"
                  value={form.note}
                  onChange={update('note')}
                  placeholder="Landmark, preferred delivery time…"
                  className="min-h-[90px]"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-ink-900">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                2
              </span>
              Payment method
            </h2>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {paymentMethods.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPaymentMethod(id)}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border p-4 text-left transition-all',
                    paymentMethod === id
                      ? 'border-indigo-500 bg-indigo-50/60 shadow-soft'
                      : 'border-ink-200 hover:border-indigo-300',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-10 w-10 place-items-center rounded-xl transition-colors',
                      paymentMethod === id ? 'bg-indigo-600 text-white' : 'bg-ink-100 text-ink-500',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-ink-900">{label}</span>
                </button>
              ))}
            </div>

            {paymentMethod === 'cod' && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 flex items-start gap-2 rounded-2xl bg-amber-50 p-4 text-xs text-amber-800"
              >
                <Landmark className="mt-0.5 h-4 w-4 shrink-0" />
                Pay the delivery agent in cash when your order arrives. We will call to confirm
                first.
              </motion.p>
            )}
          </section>
        </div>

        <aside>
          <div className="sticky top-24 rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
            <h2 className="text-lg font-semibold tracking-tight text-ink-900">Order summary</h2>

            <ul className="mt-5 flex flex-col gap-3">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 truncate text-ink-600">
                    {item.name} <span className="text-ink-400">× {item.quantity}</span>
                  </span>
                  <span className="shrink-0 font-semibold text-ink-900">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 flex flex-col gap-3 border-t border-ink-100 pt-5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">Subtotal</dt>
                <dd className="font-semibold text-ink-900">{formatCurrency(subtotal())}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">Delivery</dt>
                <dd className="font-semibold text-ink-900">
                  {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-ink-100 pt-3">
                <dt className="font-semibold text-ink-900">Total</dt>
                <dd className="text-xl font-bold text-indigo-700">
                  {formatCurrency(subtotal() + shipping)}
                </dd>
              </div>
            </dl>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700"
              >
                {error}
              </motion.p>
            )}

            <Button type="submit" size="lg" className="mt-6 w-full" loading={loading}>
              Place order
            </Button>

            <p className="mt-3 text-center text-xs text-ink-400">
              You will be able to follow every status update from your account.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
