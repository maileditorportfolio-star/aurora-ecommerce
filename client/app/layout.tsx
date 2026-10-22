import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

import { Providers } from './providers';
import { SiteChrome } from '@/components/layout/site-chrome';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    default: 'Aurora Commerce — Curated Tech, Delivered',
    template: '%s | Aurora Commerce',
  },
  description:
    'Aurora Commerce is a premium storefront for laptops, audio, displays and accessories — with live stock, fast delivery and real-time support.',
  keywords: ['ecommerce', 'aurora cyber', 'laptops', 'audio', 'displays', 'accessories'],
  openGraph: {
    title: 'Aurora Commerce',
    description: 'Curated tech, honest pricing, delivery you can track.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aurora Commerce',
    description: 'Curated tech, honest pricing, delivery you can track.',
  },
};

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-white font-sans text-ink-900">
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
