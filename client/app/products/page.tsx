import { Suspense } from 'react';
import { SkeletonList } from '@/components/ui/skeleton';
import { ProductsCatalogue } from './products-catalogue';

function CatalogueFallback() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="max-w-2xl">
        <div className="h-11 w-64 rounded-2xl bg-ink-100" />
        <div className="mt-4 h-5 w-48 rounded-xl bg-ink-100" />
      </div>

      <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="h-12 w-full rounded-full bg-ink-100 lg:max-w-sm" />
        <div className="h-11 w-40 rounded-full bg-ink-100" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <div className="hidden lg:block">
          <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-soft">
            <div className="h-4 w-28 rounded-lg bg-ink-100" />
            <div className="mt-4 flex flex-col gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-9 rounded-xl bg-ink-50" />
              ))}
            </div>
          </div>
        </div>

        <SkeletonList count={6} />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<CatalogueFallback />}>
      <ProductsCatalogue />
    </Suspense>
  );
}
