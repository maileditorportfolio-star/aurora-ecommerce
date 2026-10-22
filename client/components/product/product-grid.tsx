'use client';

import { motion } from 'framer-motion';
import { ProductCard } from '@/components/product/product-card';
import type { Product } from '@/types';

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </motion.div>
  );
}

export default ProductGrid;
