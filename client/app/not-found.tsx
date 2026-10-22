'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
      <motion.span
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 20 }}
        className="grid h-20 w-20 place-items-center rounded-3xl bg-indigo-50 text-indigo-500"
      >
        <SearchX className="h-9 w-9" />
      </motion.span>

      <div>
        <p className="text-6xl font-bold tracking-tight text-ink-900">404</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink-900">
          We could not find that page
        </h1>
        <p className="mt-2 max-w-md text-sm text-ink-500">
          The link may be broken, or the product may have been archived. The catalogue is a good
          place to restart.
        </p>
      </div>

      <div className="flex gap-3">
        <Button href="/">
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Button>
        <Button href="/products" variant="outline">
          Browse products
        </Button>
      </div>
    </div>
  );
}
