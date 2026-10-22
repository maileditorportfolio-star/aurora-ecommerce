const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { productSchema, parse } = require('../validation/schemas');

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const uniqueSlug = async (name, provided) => {
  const base = provided ? slugify(provided) : slugify(name);
  let candidate = base || `product-${Date.now()}`;
  let counter = 1;

  // eslint-disable-next-line no-await-in-loop
  while (await prisma.product.findUnique({ where: { slug: candidate } })) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }
  return candidate;
};

/** GET /api/products — public catalogue with search, filter and pagination. */
const list = asyncHandler(async (req, res) => {
  const { search, category, featured, sort = 'newest', page = '1', limit = '12' } = req.query;

  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(48, Math.max(1, Number(limit) || 12));

  const where = {
    active: true,
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
            { sku: { contains: search } },
          ],
        }
      : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(featured === 'true' ? { featured: true } : {}),
  };

  const orderBy = {
    newest: { createdAt: 'desc' },
    oldest: { createdAt: 'asc' },
    'price-asc': { price: 'asc' },
    'price-desc': { price: 'desc' },
    popular: { reviewCount: 'desc' },
    rating: { rating: 'desc' },
  }[sort] || { createdAt: 'desc' };

  const [items, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      include: { category: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  res.json({
    success: true,
    data: {
      items,
      categories,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        pages: Math.max(1, Math.ceil(total / pageSize)),
      },
    },
  });
});

/** GET /api/products/:slug */
const detail = asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { OR: [{ slug: req.params.slug }, { id: req.params.slug }], active: true },
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!product) throw ApiError.notFound('Product not found');

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, active: true, id: { not: product.id } },
    take: 4,
    orderBy: { rating: 'desc' },
  });

  res.json({ success: true, data: { product, related } });
});

/** POST /api/products — admin only. */
const create = asyncHandler(async (req, res) => {
  const payload = parse(productSchema, req.body);
  const slug = await uniqueSlug(payload.name, payload.slug);

  const product = await prisma.product.create({
    data: {
      ...payload,
      slug,
      compareAtPrice: payload.compareAtPrice ?? null,
      imageUrl: payload.imageUrl ?? null,
      gallery: payload.gallery ?? undefined,
    },
  });

  res.status(201).json({ success: true, data: { product } });
});

/** PATCH /api/products/:id — admin only. */
const update = asyncHandler(async (req, res) => {
  const payload = parse(productSchema.partial(), req.body);

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      ...payload,
      ...(payload.slug ? { slug: await uniqueSlug(payload.name || '', payload.slug) } : {}),
    },
  });

  res.json({ success: true, data: { product } });
});

/** DELETE /api/products/:id — admin only (soft delete). */
const remove = asyncHandler(async (req, res) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { active: false },
  });

  res.json({ success: true, message: 'Product archived', data: { product } });
});

/** GET /api/products/categories — admin catalogue helpers. */
const listCategories = asyncHandler(async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  res.json({ success: true, data: { categories } });
});

module.exports = { list, detail, create, update, remove, listCategories };
