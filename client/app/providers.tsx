'use client';

import { useEffect } from 'react';
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

  return <>{children}</>;
}

export default Providers;
