'use client';

import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';

const benefits = [
  'Track every order from dispatch to doorstep',
  'Save delivery details for faster checkout',
  'Message support without leaving the store',
];

/** Shared split layout for the login and registration surfaces. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page py-10 sm:py-16">
      <div className="grid overflow-hidden rounded-[2.5rem] border border-ink-200/70 bg-white shadow-card lg:grid-cols-[1.02fr_0.98fr]">
        <aside className="relative hidden overflow-hidden bg-ink-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div aria-hidden className="absolute inset-0 bg-aurora-deep opacity-85" />
          <div
            aria-hidden
            className="absolute inset-0 bg-grid-fine bg-[length:32px_32px] opacity-25 [mask-image:radial-gradient(70%_70%_at_50%_0%,black,transparent)]"
          />

          <Link href="/" className="relative flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-plasma-600 shadow-glow">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="leading-none">
              <span className="block text-base font-bold tracking-tight text-white">Aurora</span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.22em] text-signal-300/80">
                Cyber
              </span>
            </span>
          </Link>

          <div className="relative max-w-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-signal-300">
              Aurora Cyber account
            </p>
            <h2 className="mt-4 text-balance font-display text-4xl font-bold leading-[1.02] tracking-[-0.03em]">
              Your setup, <span className="text-gradient-light">remembered.</span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-ink-300">
              One account for order history, saved delivery details and a direct line to support.
            </p>
            <ul className="mt-8 flex flex-col gap-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5 text-sm text-ink-200">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-signal-300/15 text-signal-300">
                    <Check className="h-3 w-3" />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <span className="font-display text-2xl font-semibold tracking-tight text-white">
              4.8/5
            </span>
            <p className="text-xs leading-relaxed text-ink-400">
              Average storefront rating
              <br />
              across 1,200+ orders
            </p>
          </div>
        </aside>

        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12">{children}</div>
      </div>
    </div>
  );
}

export default AuthShell;
