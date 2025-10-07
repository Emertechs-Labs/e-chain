import type { Metadata } from 'next';
import '@coinbase/onchainkit/styles.css';
import './globals.css';
import { Providers } from './providers';
import Header from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import ChainWatcherClient from './components/ChainWatcherClient';
import RealtimeSubscriptionsClient from './components/RealtimeSubscriptionsClient';
import RealtimeStatus from './components/RealtimeStatus';
import { FarcasterAuthPortal } from './components/FarcasterAuthPortal';
import { ClientMiniKitWrapper } from './components/ClientMiniKitWrapper';
import { Analytics } from '@vercel/analytics/next';

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
  manifest: '/manifest.json',
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
        {/* Temporarily removed MiniKitContextProvider due to SSR issues */}
        <Providers>
          <ChainWatcherClient />
          <RealtimeSubscriptionsClient />
          <RealtimeStatus />
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-16">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
            <Footer />
            <FarcasterAuthPortal />
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
