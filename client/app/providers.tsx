'use client';

import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { useAuthStore } from '@/store/auth';

/**
 * Client-side session bootstrap: restores the persisted token and
 * revalidates it against the API once the app mounts.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export default Providers;
