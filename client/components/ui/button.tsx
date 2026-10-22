'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<Variant, string> = {
  primary:
    'bg-indigo-600 text-white shadow-soft hover:bg-indigo-500 hover:shadow-glow disabled:hover:bg-indigo-600',
  secondary:
    'bg-ink-900 text-white hover:bg-indigo-700 hover:shadow-glow disabled:hover:bg-ink-900',
  outline:
    'border border-indigo-200 bg-white text-indigo-700 hover:border-indigo-400 hover:bg-indigo-50',
  ghost: 'text-ink-600 hover:bg-indigo-50 hover:text-indigo-700',
  danger: 'bg-rose-600 text-white hover:bg-rose-500 hover:shadow-glow',
  glass: 'glass text-indigo-700 hover:bg-white/90',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-7 text-base gap-2.5',
  icon: 'h-10 w-10 p-0',
};

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: Variant;
  size?: Size;
  href?: string;
  loading?: boolean;
  children?: React.ReactNode;
}

const baseClasses =
  'inline-flex select-none items-center justify-center rounded-full font-medium tracking-tight transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', href, loading = false, children, disabled, ...props },
  ref,
) {
  const classes = cn(baseClasses, variants[variant], sizes[size], className);

  const content = (
    <>
      {loading && (
        <motion.span
          aria-hidden
          className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {children}
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        className={classes}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 24 }}
        {...(props as React.ComponentProps<typeof motion.a>)}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      {...props}
    >
      {content}
    </motion.button>
  );
});

export default Button;
