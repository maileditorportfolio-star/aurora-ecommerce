import { vi } from 'vitest';
import { createRequire } from 'node:module';

const nodeRequire = createRequire(import.meta.url);

const PRISMA_PATH = nodeRequire.resolve('../../src/config/prisma.js');

/**
 * Builds a stand-in for the Prisma client. Every model exposes the query methods
 * the API actually uses so specs can assert on calls without a live database.
 */
export const createPrismaMock = () => ({
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  product: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  order: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  category: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
  },
  message: {
    findMany: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn(),
  $queryRaw: vi.fn(),
  $connect: vi.fn(),
  $disconnect: vi.fn(),
});

/**
 * The API is CommonJS, so `vi.mock` cannot intercept the `require()` calls
 * inside controllers. Seeding `require.cache` before the app is loaded does
 * work, and keeps every spec runnable without a MySQL instance.
 */
export const installPrismaMock = (mock) => {
  nodeRequire.cache[PRISMA_PATH] = {
    id: PRISMA_PATH,
    filename: PRISMA_PATH,
    loaded: true,
    exports: mock,
    children: [],
    paths: nodeRequire.cache[PRISMA_PATH]?.paths || [],
  };

  return mock;
};

const resetDeep = (node) => {
  Object.values(node).forEach((value) => {
    if (value && typeof value.mockReset === 'function') value.mockReset();
    else if (value && typeof value === 'object') resetDeep(value);
  });
};

/** Returns every mock to a clean slate without losing the database health check. */
export const resetPrisma = (prisma) => {
  resetDeep(prisma);
  prisma.$queryRaw.mockResolvedValue([{ 1: 1 }]);
  prisma.$connect.mockResolvedValue(undefined);
  prisma.$disconnect.mockResolvedValue(undefined);
};

export { nodeRequire };
