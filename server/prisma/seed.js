/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const categories = [
  { name: 'Laptops', slug: 'laptops', description: 'Business and creator laptops.' },
  { name: 'Accessories', slug: 'accessories', description: 'Everyday gear that upgrades your desk.' },
  { name: 'Audio', slug: 'audio', description: 'Headphones, earbuds and studio sound.' },
  { name: 'Displays', slug: 'displays', description: 'Monitors and panels for every desk size.' },
  { name: 'Networking', slug: 'networking', description: 'Routers, switches and connectivity.' },
];

const products = [
  {
    name: 'Aurora Pro 14 Ultrabook',
    category: 'laptops',
    imageUrl: 'https://picsum.photos/seed/aurora-laptop/900/700',
    price: 118000,
    compareAtPrice: 135000,
    stock: 18,
    featured: true,
    rating: 4.8,
    reviewCount: 124,
    description:
      'A 14-inch ultrabook with a 120Hz LTPO display, all-day battery and a fanless chassis. Machined aluminium, 16GB of memory and a 1TB NVMe drive make it a dependable daily driver for design and engineering work.',
  },
  {
    name: 'Vertex Studio Headphones',
    imageUrl: 'https://picsum.photos/seed/aurora-headphones/900/700',
    category: 'audio',
    price: 18500,
    compareAtPrice: 22000,
    stock: 42,
    featured: true,
    rating: 4.7,
    reviewCount: 312,
    description:
      'Closed-back studio headphones with 40mm graphene drivers and adaptive noise cancelling. A memory-foam headband and detachable cable make long sessions comfortable.',
  },
  {
    name: 'Pulse Wireless Earbuds',
    imageUrl: 'https://picsum.photos/seed/aurora-earbuds/900/700',
    category: 'audio',
    price: 4200,
    compareAtPrice: 5500,
    stock: 96,
    rating: 4.4,
    reviewCount: 508,
    description:
      'Lightweight earbuds with 32 hours of playback, IPX5 water resistance and a low-latency gaming mode. Fast charging gives you four more hours in ten minutes.',
  },
  {
    name: 'Lumen 27" 4K Monitor',
    imageUrl: 'https://picsum.photos/seed/aurora-monitor/900/700',
    category: 'displays',
    price: 46500,
    compareAtPrice: 52000,
    stock: 12,
    featured: true,
    rating: 4.6,
    reviewCount: 87,
    description:
      'A 27-inch 4K IPS panel calibrated for 98% DCI-P3 coverage with a single-cable 90W USB-C dock. Height, tilt and swivel adjust to any posture.',
  },
  {
    name: 'Lumen 34" Ultrawide',
    imageUrl: 'https://picsum.photos/seed/aurora-ultrawide/900/700',
    category: 'displays',
    price: 78000,
    compareAtPrice: 89000,
    stock: 7,
    rating: 4.7,
    reviewCount: 64,
    description:
      'A 34-inch curved ultrawide with 144Hz refresh, picture-by-picture and KVM switching. The single flat cable carries video, data and 65W of power.',
  },
  {
    name: 'Forge 65W GaN Charger',
    imageUrl: 'https://picsum.photos/seed/aurora-charger/900/700',
    category: 'accessories',
    price: 3900,
    compareAtPrice: 4800,
    stock: 150,
    rating: 4.9,
    reviewCount: 421,
    description:
      'Two USB-C ports and one USB-A in a body smaller than a matchbox. Gallium nitride keeps it cool while charging a laptop, a phone and a tablet at once.',
  },
  {
    name: 'Flux Mechanical Keyboard',
    imageUrl: 'https://picsum.photos/seed/aurora-keyboard/900/700',
    category: 'accessories',
    price: 9800,
    compareAtPrice: 11500,
    stock: 34,
    rating: 4.6,
    reviewCount: 233,
    description:
      'A 75% hot-swappable mechanical keyboard with gasket mounting, PBT keycaps and south-facing RGB. Connects over USB-C, Bluetooth or the bundled 2.4GHz receiver.',
  },
  {
    name: 'Glide Wireless Mouse',
    imageUrl: 'https://picsum.photos/seed/aurora-mouse/900/700',
    category: 'accessories',
    price: 3200,
    compareAtPrice: 3900,
    stock: 88,
    rating: 4.3,
    reviewCount: 176,
    description:
      'A 68-gram wireless mouse with a 26,000 DPI sensor, PTFE feet and 70-hour battery. Quiet clicks make it a favourite for shared desks and late-night sessions.',
  },
  {
    name: 'Beacon Mesh Router',
    imageUrl: 'https://picsum.photos/seed/aurora-router/900/700',
    category: 'networking',
    price: 12500,
    compareAtPrice: 14900,
    stock: 26,
    featured: true,
    rating: 4.5,
    reviewCount: 142,
    description:
      'Tri-band mesh networking with 2.5GbE backhaul, WPA3 and automatic band steering. Expand coverage node by node without losing a single setting.',
  },
  {
    name: 'Vault USB-C Hub',
    imageUrl: 'https://picsum.photos/seed/aurora-hub/900/700',
    category: 'accessories',
    price: 5400,
    compareAtPrice: 6500,
    stock: 61,
    rating: 4.4,
    reviewCount: 298,
    description:
      'A 9-in-1 aluminium hub with HDMI 2.0, 100W pass-through, SD and microSD readers, plus gigabit ethernet. Built to survive a daily commute.',
  },
];

const main = async () => {
  const passwordHash = await bcrypt.hash('aurora123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@aurora.com' },
    update: {},
    create: {
      name: 'Aurora Admin',
      email: 'admin@aurora.com',
      passwordHash,
      phone: '+8801700000000',
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'customer@aurora.com' },
    update: {},
    create: {
      name: 'Demo Customer',
      email: 'customer@aurora.com',
      passwordHash,
      phone: '+8801800000000',
      role: 'CUSTOMER',
    },
  });

  const categoryMap = {};
  for (const category of categories) {
    // eslint-disable-next-line no-await-in-loop
    categoryMap[category.slug] = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  for (const product of products) {
    const { category, ...data } = product;
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    // eslint-disable-next-line no-await-in-loop
    await prisma.product.upsert({
      where: { slug },
      update: { ...data, categoryId: categoryMap[category].id },
      create: { ...data, slug, categoryId: categoryMap[category].id },
    });
  }

  console.log(`Seeded admin: ${admin.email} / aurora123`);
  console.log('Seeded customer: customer@aurora.com / aurora123');
  console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
