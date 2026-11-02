import { createRequire } from 'node:module';

const nodeRequire = createRequire(import.meta.url);

export const request = nodeRequire('supertest');
export const app = nodeRequire('../../src/app.js');
export const prisma = nodeRequire('../../src/config/prisma.js');

export const uniqueSuffix = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** Creates a uniquely named product and removes it again in the test teardown. */
export const createProduct = async (overrides = {}) => {
  const category = await prisma.category.findFirst();
  const suffix = uniqueSuffix();

  return prisma.product.create({
    data: {
      name: `Integration Product ${suffix}`,
      slug: `integration-product-${suffix}`,
      description: 'Created by the database integration suite and removed afterwards.',
      price: 1000,
      stock: 5,
      active: true,
      categoryId: category?.id ?? null,
      ...overrides,
    },
  });
};

/** Deletes users (and their orders) plus any product created for a spec. */
export const removeFixtures = async ({ userId, productId } = {}) => {
  if (userId) {
    await prisma.order.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  }
  if (productId) {
    await prisma.product.deleteMany({ where: { id: productId } });
  }
};
