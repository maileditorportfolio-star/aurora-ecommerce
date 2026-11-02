'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DEFAULT_STOREFRONT_SETTINGS } from '@/lib/permissions';
import type { StorefrontSettings } from '@/types';

const StorefrontSettingsContext = createContext<StorefrontSettings>(DEFAULT_STOREFRONT_SETTINGS);

/** Loads the live storefront copy once and shares it across the header and home page. */
export function StorefrontSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StorefrontSettings>(DEFAULT_STOREFRONT_SETTINGS);

  useEffect(() => {
    let active = true;

    api.storefront
      .settings()
      .then(({ settings: live }) => {
        if (active) setSettings({ ...DEFAULT_STOREFRONT_SETTINGS, ...live });
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  return (
    <StorefrontSettingsContext.Provider value={settings}>
      {children}
    </StorefrontSettingsContext.Provider>
  );
}

export const useStorefrontSettings = () => useContext(StorefrontSettingsContext);

export default StorefrontSettingsProvider;
