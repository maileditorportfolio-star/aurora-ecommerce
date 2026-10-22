'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { formatCurrency } from '@/lib/utils';

export function CartDrawer() {
  const { items, isOpen, close, removeItem, updateQuantity } = useCartStore();

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = subtotal >= 5000 || subtotal === 0 ? 0 : 60;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-ink-950/40 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
            className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-md flex-col bg-white shadow-card"
          >
            <header className="flex items-center justify-between border-b border-ink-100 px-6 py-5">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-5 w-5 text-indigo-600" />
                <h2 className="text-base font-semibold tracking-tight text-ink-900">Your cart</h2>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                  {items.length}
                </span>
              </div>
              <button
                onClick={close}
                aria-label="Close cart"
                className="grid h-9 w-9 place-items-center rounded-full text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex h-full flex-col items-center justify-center gap-4 text-center"
                >
                  <div className="grid h-16 w-16 place-items-center rounded-3xl bg-indigo-50 text-indigo-500">
                    <ShoppingBag className="h-7 w-7" />
                  </div>
                  <p className="text-sm text-ink-500">Your cart is empty.</p>
                  <Button href="/products" size="sm" onClick={close}>
                    Browse products
                  </Button>
                </motion.div>
              ) : (
                <ul className="flex flex-col gap-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.productId}
                        layout
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 24, height: 0, marginBottom: -16 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="flex gap-4 rounded-2xl border border-ink-100 p-3"
                      >
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ink-100">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full animate-pulse bg-gradient-to-br from-indigo-200 to-indigo-400" />
                          )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/products/${item.slug}`}
                              onClick={close}
                              className="truncate text-sm font-semibold text-ink-900 hover:text-indigo-700"
                            >
                              {item.name}
                            </Link>
                            <button
                              onClick={() => removeItem(item.productId)}
                              aria-label={`Remove ${item.name}`}
                              className="text-ink-400 transition-colors hover:text-rose-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 rounded-full border border-ink-200 p-0.5">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                aria-label="Decrease quantity"
                                className="grid h-6 w-6 place-items-center rounded-full text-ink-600 transition-colors hover:bg-ink-100"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-semibold text-ink-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                aria-label="Increase quantity"
                                className="grid h-6 w-6 place-items-center rounded-full text-ink-600 transition-colors hover:bg-ink-100"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="text-sm font-semibold text-ink-900">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-ink-100 bg-ink-50/60 px-6 py-5">
                <div className="flex items-center justify-between text-sm text-ink-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-ink-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm text-ink-500">
                  <span>Shipping</span>
                  <span className="font-semibold text-ink-900">
                    {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-ink-200 pt-3">
                  <span className="text-sm font-semibold text-ink-900">Total</span>
                  <span className="text-lg font-bold text-indigo-700">
                    {formatCurrency(subtotal + shipping)}
                  </span>
                </div>
                <Button href="/checkout" onClick={close} className="mt-4 w-full" size="lg">
                  Checkout
                </Button>
                <button
                  onClick={close}
                  className="mt-2 w-full rounded-full py-2 text-xs font-medium text-ink-500 transition-colors hover:text-indigo-700"
                >
                  Continue shopping
                </button>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default CartDrawer;
