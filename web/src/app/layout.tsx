import type { Metadata } from 'next';
import { Raleway, Source_Sans_3 } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-raleway',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'JaxMart | India\'s Trusted B2B Marketplace',
  description: 'Discover verified suppliers, source products, hire services, and transact safely with escrow protection on JaxMart.',
  keywords: 'B2B marketplace, wholesale, suppliers India, industrial supplies, business procurement',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${raleway.variable} ${sourceSans.variable}`}>
      <body>
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
