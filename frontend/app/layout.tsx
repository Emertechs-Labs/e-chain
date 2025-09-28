import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Header from './components/layout/Header';
import ErrorBoundary from './components/ErrorBoundary';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
});

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
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
            <footer className="bg-slate-900 border-t border-slate-800 text-gray-400 py-8">
              <div className="container mx-auto px-4 text-center">
                <p>&copy; 2025 Echain Events. Powered by blockchain technology.</p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
