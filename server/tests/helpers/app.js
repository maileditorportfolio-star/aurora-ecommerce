import { createRequire } from 'node:module';
import { createPrismaMock, installPrismaMock, resetPrisma } from './prisma-mock.js';

const nodeRequire = createRequire(import.meta.url);

/**
 * Boots the Express app with the Prisma client replaced by a mock.
 * Environment variables are set before the app is required so the config
 * module picks up test-friendly values.
 */
export const setupApp = () => {
  process.env.NODE_ENV = 'test';
  process.env.BCRYPT_ROUNDS = '4';
  process.env.AUTH_RATE_LIMIT = '1000';
  process.env.JWT_SECRET = 'test-secret-aurora-commerce';

  const prisma = installPrismaMock(createPrismaMock());
  resetPrisma(prisma);

  const app = nodeRequire('../../src/app.js');

  return { app, prisma, reset: () => resetPrisma(prisma) };
};

/** Signs a real JWT for the given user so auth guards can be exercised end to end. */
export const tokenFor = (user) => {
  const { signToken } = nodeRequire('../../src/services/token.service.js');
  return `Bearer ${signToken(user)}`;
};

export const customer = {
  id: 'user-customer',
  name: 'Demo Customer',
  email: 'customer@aurora.com',
  phone: '+8801800000000',
  role: 'CUSTOMER',
  avatarUrl: null,
};

export const admin = {
  id: 'user-admin',
  name: 'Aurora Admin',
  email: 'admin@aurora.com',
  phone: '+8801700000000',
  role: 'ADMIN',
  avatarUrl: null,
};

export const product = {
  id: 'product-1',
  name: 'Aurora Pro 14 Ultrabook',
  slug: 'aurora-pro-14-ultrabook',
  description: 'A 14-inch ultrabook with a 120Hz LTPO display and all-day battery.',
  price: 118000,
  compareAtPrice: 135000,
  imageUrl: 'https://picsum.photos/seed/aurora-laptop/900/700',
  stock: 18,
  rating: 4.8,
  reviewCount: 124,
  featured: true,
  active: true,
  categoryId: 'category-1',
};

export const order = {
  id: 'order-1',
  orderNumber: 'AUR-TEST-0001',
  userId: customer.id,
  status: 'PENDING',
  subtotal: 118000,
  shipping: 0,
  tax: 0,
  total: 118000,
  paymentMethod: 'cod',
  paymentStatus: 'UNPAID',
  shippingName: 'Demo Customer',
  shippingPhone: '+8801800000000',
  shippingAddress: 'House 1, Road 2, Dhaka 1207',
  shippingCity: 'Dhaka',
  shippingZip: '1207',
  shippingCountry: 'Bangladesh',
  note: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  items: [],
};
