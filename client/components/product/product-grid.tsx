'use client';

import { motion } from 'framer-motion';
import { ProductCard } from '@/components/product/product-card';
import type { Product } from '@/types';

export function ProductGrid({
  products,
  children,
}: {
  products: Product[];
  children?: React.ReactNode;
}) {
  return (
    <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
      {children}
    </motion.div>
  );
}

export default ProductGrid;
