'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartDrawer } from '@/components/layout/cart-drawer';
import { ChatWidget } from '@/components/chat/chat-widget';
import { ScrollProgress } from '@/components/motion/scroll-progress';

/**
 * The storefront header/footer are hidden on /admin so the console
 * can own the full viewport.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isCheckout = pathname?.startsWith('/checkout') || pathname?.startsWith('/cart');

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <ScrollProgress />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <CartDrawer />
      {!isCheckout && <ChatWidget />}
    </>
  );
}

export default SiteChrome;
