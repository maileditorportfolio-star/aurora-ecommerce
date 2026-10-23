import { formatCurrency } from '@/lib/utils';

/**
 * Testing Library matches against the raw text node, and `Intl` separates the
 * currency code from the amount with a non-breaking space. This builds an
 * anchored pattern that tolerates either kind of whitespace.
 */
export const money = (value: number): RegExp => {
  const formatted = formatCurrency(value)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\u00a0/g, '\\s');
  return new RegExp(`^${formatted}$`);
};
