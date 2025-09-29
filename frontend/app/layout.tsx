import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Providers } from './providers';
import Header from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import ErrorBoundary from './components/ErrorBoundary';

// Use system font stack to avoid remote Google Fonts fetch during dev/build
// Keep a CSS variable for compatibility with existing styles
const inter = {
  variable: '--font-inter',
} as const;

export const metadata: Metadata = {
  title: 'Echain Events - Blockchain Event Ticketing',
  description: 'Create and attend blockchain-powered events with NFT tickets and POAP rewards',
  keywords: ['blockchain', 'events', 'NFT', 'tickets', 'POAP', 'Web3'],
  authors: [{ name: 'Echain Team' }],
  creator: 'Echain',
  publisher: 'Echain',
  robots: 'index, follow',
  openGraph: {
    title: 'Echain Events - Blockchain Event Ticketing',
    description: 'Create and attend blockchain-powered events with NFT tickets and POAP rewards',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Echain Events',
    description: 'Blockchain-powered event ticketing platform',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        {/* Use Next's Script with beforeInteractive so script runs before hydration
            and is correctly ordered by Next/webpack. This avoids invalid HTML
            (script as child of <html>) and hydration mismatches. */}
        <Script id="echain-theme" strategy="beforeInteractive">
          {`(function(){
            try {
              var key = 'echain-theme';
              var t = localStorage.getItem(key);
              if (!t || ['light','dark','system'].indexOf(t) === -1) return;
              if (t === 'system') {
                var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
              } else {
                document.documentElement.classList.add(t);
              }
            } catch(e){}
          })();`}
        </Script>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-16">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
