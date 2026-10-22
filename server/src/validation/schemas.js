const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().email('Enter a valid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  phone: z.string().trim().max(24).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase and dash separated')
    .optional(),
  description: z.string().trim().min(10).max(8000),
  price: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().min(0).nullish(),
  imageUrl: z.string().url().nullish(),
  gallery: z.array(z.string().url()).nullish(),
  sku: z.string().trim().max(64).nullish(),
  stock: z.coerce.number().int().min(0).default(0),
  categoryId: z.string().nullish(),
  featured: z.coerce.boolean().default(false),
  active: z.coerce.boolean().default(true),
});

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99),
});

const checkoutSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Your cart is empty'),
  shippingName: z.string().trim().min(2).max(80),
  shippingPhone: z.string().trim().min(6).max(24),
  shippingAddress: z.string().trim().min(8).max(400),
  shippingCity: z.string().trim().max(80).optional(),
  shippingZip: z.string().trim().max(20).optional(),
  shippingCountry: z.string().trim().max(80).default('Bangladesh'),
  paymentMethod: z.enum(['cod', 'bkash', 'nagad', 'card']).default('cod'),
  note: z.string().trim().max(1000).optional(),
});

const messageSchema = z.object({
  conversationId: z.string().trim().max(64).default('support'),
  content: z.string().trim().min(1, 'Message cannot be empty').max(2000),
});

/** Runs a zod schema and throws a 400 ApiError with field details on failure. */
const parse = (schema, payload) => {
  const result = schema.safeParse(payload);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    const ApiError = require('../utils/ApiError');
    throw ApiError.badRequest(details[0]?.message || 'Invalid request', details);
  }
  return result.data;
};

module.exports = {
  registerSchema,
  loginSchema,
  productSchema,
  orderItemSchema,
  checkoutSchema,
  messageSchema,
  parse,
};
