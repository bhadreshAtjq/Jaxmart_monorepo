import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';
import { ScrollRestorer } from '@/components/ScrollRestorer';

const raleway = localFont({
  src: [
    {
      path: './fonts/Raleway-400.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Raleway-500.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/Raleway-600.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/Raleway-700.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/Raleway-800.woff2',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-raleway',
  display: 'swap',
});

const sourceSans = localFont({
  src: [
    {
      path: './fonts/SourceSans3-400.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/SourceSans3-500.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/SourceSans3-600.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/SourceSans3-700.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-source',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'JaxMart | India\'s Trusted B2B Marketplace',
  description: 'Discover verified suppliers, source products, hire services, and transact safely with escrow protection on JaxMart.',
  keywords: 'B2B marketplace, wholesale, suppliers India, industrial supplies, business procurement',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon-57x57.png', sizes: '57x57', type: 'image/png' },
      { url: '/apple-icon-60x60.png', sizes: '60x60', type: 'image/png' },
      { url: '/apple-icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/apple-icon-76x76.png', sizes: '76x76', type: 'image/png' },
      { url: '/apple-icon-114x114.png', sizes: '114x114', type: 'image/png' },
      { url: '/apple-icon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/apple-icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/apple-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${raleway.variable} ${sourceSans.variable}`}>
      <body>
        <ScrollRestorer />
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                fontFamily: 'var(--font-source), Source Sans 3, sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                background: '#061E29',
                color: '#F3F4F4',
                borderRadius: '12px',
                padding: '12px 16px',
              },
              success: {
                iconTheme: { primary: '#5F9598', secondary: '#F3F4F4' },
              },
              error: {
                iconTheme: { primary: '#C0392B', secondary: '#F3F4F4' },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
