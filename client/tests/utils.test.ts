import { describe, it, expect } from 'vitest';
import {
  cn,
  formatCurrency,
  formatNumber,
  formatDate,
  formatRelativeTime,
  slugify,
  discountPercent,
  initials,
} from '@/lib/utils';

describe('cn', () => {
  it('joins truthy class names', () => {
    expect(cn('p-4', false, undefined, 'text-ink-900', null, '')).toBe('p-4 text-ink-900');
  });
});

describe('formatCurrency', () => {
  it('renders Bangladeshi taka with no decimals', () => {
    expect(formatCurrency(118000)).toMatch(/BDT|৳/);
    expect(formatCurrency(118000)).not.toContain('.00');
  });

  it('supports another currency', () => {
    expect(formatCurrency(42, 'USD')).toMatch(/US\$|\$/);
  });

  it('treats missing values as zero', () => {
    expect(formatCurrency(undefined as unknown as number)).toBe(formatCurrency(0));
  });
});

describe('formatNumber', () => {
  it('groups thousands', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('treats missing values as zero', () => {
    expect(formatNumber(undefined as unknown as number)).toBe('0');
  });
});

describe('formatDate', () => {
  it('formats an ISO date as day, short month and year', () => {
    expect(formatDate('2026-10-22T12:00:00.000Z')).toBe('22 Oct 2026');
  });

  it('accepts a Date instance', () => {
    expect(formatDate(new Date('2026-01-05T12:00:00.000Z'))).toBe('05 Jan 2026');
  });

  it('returns an empty string for a missing value', () => {
    expect(formatDate('')).toBe('');
  });
});

describe('formatRelativeTime', () => {
  it('describes just now', () => {
    expect(formatRelativeTime(new Date())).toBe('just now');
  });

  it('describes minutes, hours and days', () => {
    const minutes = (count: number) => new Date(Date.now() - count * 60_000);

    expect(formatRelativeTime(minutes(5))).toBe('5 minutes ago');
    expect(formatRelativeTime(minutes(120))).toBe('2 hours ago');
    expect(formatRelativeTime(minutes(60 * 24 * 3))).toBe('3 days ago');
  });

  it('accepts ISO strings', () => {
    expect(formatRelativeTime(new Date(Date.now() - 90 * 60_000).toISOString())).toBe(
      '2 hours ago',
    );
  });
});

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Aurora Pro 14 Ultrabook')).toBe('aurora-pro-14-ultrabook');
  });

  it('trims punctuation and surrounding hyphens', () => {
    expect(slugify('  Aurora — Pro!! ')).toBe('aurora-pro');
  });
});

describe('discountPercent', () => {
  it('computes the rounded discount', () => {
    expect(discountPercent(118000, 135000)).toBe(13);
  });

  it('returns zero without a higher compare-at price', () => {
    expect(discountPercent(100)).toBe(0);
    expect(discountPercent(100, null)).toBe(0);
    expect(discountPercent(100, 100)).toBe(0);
    expect(discountPercent(100, 80)).toBe(0);
  });
});

describe('initials', () => {
  it('takes the first letter of the first two words', () => {
    expect(initials('Nafis Hasan')).toBe('NH');
    expect(initials('Aurora Commerce Bangladesh')).toBe('AC');
  });

  it('handles single names and empty segments', () => {
    expect(initials('Aurora')).toBe('A');
    expect(initials('  Nafis   Hasan  ')).toBe('NH');
  });
});
