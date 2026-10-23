import type { AdminCustomer, AdminStats } from '@/lib/api';
import type { Order, Product } from '@/types';

export const productFixture = (overrides: Partial<Product> = {}): Product => ({
  id: 'product-1',
  name: 'Aurora Pro 14 Ultrabook',
  slug: 'aurora-pro-14-ultrabook',
  description: 'A 14-inch ultrabook with a 120Hz LTPO display and all-day battery.',
  price: 118000,
  compareAtPrice: 135000,
  imageUrl: 'https://example.com/laptop.png',
  stock: 18,
  rating: 4.8,
  reviewCount: 124,
  featured: true,
  active: true,
  categoryId: 'category-1',
  category: { id: 'category-1', name: 'Laptops', slug: 'laptops' },
  ...overrides,
});

export const cartItemFixture = (overrides: Partial<Product> = {}) => {
  const product = productFixture(overrides);
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl,
    stock: product.stock,
    quantity: 1,
  };
};

export const orderFixture = (overrides: Partial<Order> = {}): Order => ({
  id: 'order-1',
  orderNumber: 'AUR-TEST-0001',
  userId: 'user-1',
  status: 'SHIPPED',
  subtotal: 118000,
  shipping: 0,
  tax: 0,
  total: 118000,
  paymentMethod: 'cod',
  paymentStatus: 'UNPAID',
  shippingName: 'Nafis Hasan',
  shippingPhone: '+8801800000000',
  shippingAddress: 'House 1, Road 2, Dhaka 1207',
  shippingCity: 'Dhaka',
  shippingZip: '1207',
  shippingCountry: 'Bangladesh',
  note: null,
  createdAt: '2026-10-01T10:00:00.000Z',
  items: [
    {
      id: 'item-1',
      productId: 'product-1',
      name: 'Aurora Pro 14 Ultrabook',
      imageUrl: 'https://example.com/laptop.png',
      unitPrice: 118000,
      quantity: 1,
      subtotal: 118000,
    },
  ],
  ...overrides,
});

export const adminStatsFixture = (overrides: Partial<AdminStats> = {}): AdminStats => ({
  totals: {
    revenue: 420000,
    pipeline: 96000,
    orders: 42,
    products: 12,
    customers: 7,
    categories: 3,
    averageOrder: 10000,
  },
  revenueByMonth: [
    { month: 'May', revenue: 60000, orders: 6 },
    { month: 'Jun', revenue: 80000, orders: 8 },
  ],
  statusCounts: [
    { status: 'DELIVERED', count: 12 },
    { status: 'PENDING', count: 4 },
  ],
  topProducts: [{ name: 'Aurora Pro 14 Ultrabook', units: 9 }],
  lowStock: [{ id: 'product-2', name: 'Aurora Buds Pro', stock: 3 }],
  ...overrides,
});

export const adminCustomerFixture = (overrides: Partial<AdminCustomer> = {}): AdminCustomer => ({
  id: 'customer-1',
  name: 'Nafis Hasan',
  email: 'nafis@aurora.com',
  phone: '+8801800000000',
  createdAt: '2026-02-01T10:00:00.000Z',
  orderCount: 3,
  lifetimeValue: 240000,
  ...overrides,
});

export const userFixture = {
  id: 'user-1',
  name: 'Nafis Hasan',
  email: 'nafis@aurora.com',
  phone: '+8801800000000',
  role: 'CUSTOMER' as const,
  avatarUrl: null,
};
