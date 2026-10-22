'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { formatCurrency } from '@/lib/utils';

const FREE_DELIVERY_THRESHOLD = 5000;
const SHIPPING_RATE = 60;

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCartStore();

  const shipping = subtotal() >= FREE_DELIVERY_THRESHOLD || subtotal() === 0 ? 0 : SHIPPING_RATE;
  const total = subtotal() + shipping;
  const progress = Math.min(100, (subtotal() / FREE_DELIVERY_THRESHOLD) * 100);

  if (items.length === 0) {
    return (
      <div className="container-page flex flex-col items-center gap-6 py-28 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="grid h-20 w-20 place-items-center rounded-3xl bg-indigo-50 text-indigo-500"
        >
          <ShoppingBag className="h-9 w-9" />
        </motion.div>
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">Your cart is empty</h1>
        <p className="max-w-md text-sm text-ink-500">
          Browse the catalogue and add something you will actually use every day.
        </p>
        <Button href="/products" size="lg">
          Start shopping
          <ArrowRight className="h-4 w-4" />
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
        Your cart
      </motion.h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <ul className="flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.productId}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40, height: 0, marginBottom: -16 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="flex flex-col gap-4 rounded-3xl border border-ink-100 bg-white p-4 shadow-soft sm:flex-row sm:items-center"
              >
                <Link
                  href={`/products/${item.slug}`}
                  className="h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-ink-100 sm:h-24 sm:w-24"
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-indigo-200 to-sky-300" />
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${item.slug}`}
                    className="text-base font-semibold text-ink-900 transition-colors hover:text-indigo-700"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-ink-500">{formatCurrency(item.price)} each</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 rounded-full border border-ink-200 p-0.5">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="grid h-8 w-8 place-items-center rounded-full text-ink-600 transition-colors hover:bg-ink-100"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm font-semibold text-ink-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="grid h-8 w-8 place-items-center rounded-full text-ink-600 transition-colors hover:bg-ink-100"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <span className="w-24 text-right text-base font-bold text-ink-900">
                    {formatCurrency(item.price * item.quantity)}
                  </span>

                  <button
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.name}`}
                    className="text-ink-400 transition-colors hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <aside>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="sticky top-24 rounded-3xl border border-ink-100 bg-white p-6 shadow-soft"
          >
            <h2 className="text-lg font-semibold tracking-tight text-ink-900">Order summary</h2>

            <div className="mt-5 rounded-2xl bg-indigo-50/70 p-4">
              <p className="text-xs font-medium text-indigo-700">
                {shipping === 0
                  ? 'You unlocked free delivery.'
                  : `Add ${formatCurrency(FREE_DELIVERY_THRESHOLD - subtotal())} more for free delivery.`}
              </p>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white">
                <motion.div
                  className="h-full rounded-full bg-indigo-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>

            <dl className="mt-6 flex flex-col gap-3 text-sm">
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
                <dd className="text-xl font-bold text-indigo-700">{formatCurrency(total)}</dd>
              </div>
            </dl>

            <Button href="/checkout" size="lg" className="mt-6 w-full">
              Proceed to checkout
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button href="/products" variant="ghost" className="mt-2 w-full">
              Continue shopping
            </Button>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}
