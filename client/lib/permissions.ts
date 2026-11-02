import type { StorefrontSettings } from '@/types';

export const DEFAULT_STOREFRONT_SETTINGS: StorefrontSettings = {
  announcement: 'Free delivery over ৳5,000',
  heroEyebrow: 'Aurora Cyber / 2026 collection',
  heroTitle: 'Tech that feels',
  heroHighlight: 'effortless',
  heroDescription:
    'A tightly curated shelf of laptops, audio, displays and desk gear. Honest pricing, live stock and delivery you can track from checkout to doorstep.',
  heroProductSlug: null,
  showMarquee: true,
  showCategories: true,
  showFeatures: true,
};

export const PERMISSION_LABELS: Record<string, string> = {
  'products.write': 'Manage products',
  'orders.read': 'View orders',
  'orders.write': 'Update order status',
  'customers.read': 'View customers',
  'analytics.read': 'View dashboard and analytics',
  'design.write': 'Edit storefront design',
};

export const ALL_PERMISSIONS = Object.keys(PERMISSION_LABELS);
