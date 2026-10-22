'use client';

import { motion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 12, filter: 'blur(6px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: 'blur(6px)',
    transition: { duration: 0.25, ease: 'easeIn' },
  },
};

/** Wraps every route in a soft enter/exit transition. Mounted from `app/template.tsx`. */
export function PageTransition({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn('min-h-[60vh]', className)}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
