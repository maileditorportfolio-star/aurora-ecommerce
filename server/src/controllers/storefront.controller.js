const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { storefrontSchema, parse } = require('../validation/schemas');

const DEFAULTS = {
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

const view = (record) => {
  if (!record) return DEFAULTS;
  return {
    announcement: record.announcement,
    heroEyebrow: record.heroEyebrow,
    heroTitle: record.heroTitle,
    heroHighlight: record.heroHighlight,
    heroDescription: record.heroDescription,
    heroProductSlug: record.heroProductSlug ?? null,
    showMarquee: record.showMarquee,
    showCategories: record.showCategories,
    showFeatures: record.showFeatures,
  };
};

/** GET /api/settings/storefront — public storefront configuration. */
const getPublic = asyncHandler(async (_req, res) => {
  const settings = await prisma.storefrontSetting.findUnique({ where: { id: 'default' } });
  res.json({ success: true, data: { settings: view(settings) } });
});

/** GET /api/admin/storefront — settings for the design editor. */
const getAdmin = getPublic;

/** PATCH /api/admin/storefront — update the live storefront settings. */
const update = asyncHandler(async (req, res) => {
  const payload = parse(storefrontSchema, req.body);

  const settings = await prisma.storefrontSetting.upsert({
    where: { id: 'default' },
    update: payload,
    create: { id: 'default', ...payload },
  });

  res.json({ success: true, data: { settings: view(settings) } });
});

module.exports = { getPublic, getAdmin, update, DEFAULTS };
