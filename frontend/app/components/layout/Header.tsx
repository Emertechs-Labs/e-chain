'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { EnhancedConnectButton } from '../EnhancedConnectButton';
import { ThemeToggle } from '../ThemeToggle';
import { usePendingTransactions } from '../TransactionStatus';
import { Clock } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isConnected } = useAccount();
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/';

  // Redirect to dashboard after wallet connection
  useEffect(() => {
    if (isConnected && pathname === '/') {
      router.push('/my-events');
    }
  }, [isConnected, pathname, router]);

  const navigation = [
    { name: 'Events', href: '/events' },
    { name: 'Create Event', href: '/events/create', requiresAuth: true },
    { name: 'My Events', href: '/my-events', requiresAuth: true },
    { name: 'My Tickets', href: '/my-tickets', requiresAuth: true },
    { name: 'POAPs', href: '/poaps', requiresAuth: true },
  ];

  const visibleNavigation = navigation.filter(
    (item) => !item.requiresAuth || isConnected
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="ml-2 text-xl font-bold gradient-text">
                Echain
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Minimal */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href={isHomePage ? "#hero" : "/#hero"} className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              Home
            </Link>
            <Link href={isHomePage ? "#events" : "/events"} className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              Events
            </Link>
            {isConnected && (
              <Link href="/events/create" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                Create
              </Link>
            )}
            <Link href={isHomePage ? "#features" : "/#features"} className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              Features
            </Link>
            <Link href={isHomePage ? "#faq" : "/#faq"} className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              FAQ
            </Link>
            <Link href="/marketplace" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              Marketplace
            </Link>
            <Link href="/transparency" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              Transparency
            </Link>

            {/* Theme Toggle */}
            <div className="ml-2">
              <ThemeToggle />
            </div>

            {/* Connect Wallet - Enhanced ConnectButton */}
            <div className="ml-4">
              <EnhancedConnectButton />
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <div className="h-6 w-6">
              {isMenuOpen ? (
                <span className="text-lg">✕</span>
              ) : (
                <span className="text-lg">☰</span>
              )}
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border/50 bg-background/95">
              <Link
                href={isHomePage ? "#events" : "/events"}
                className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Events
              </Link>
              {isConnected && (
                <Link
                  href="/events/create"
                  className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create Event
                </Link>
              )}
              <Link
                href={isHomePage ? "#features" : "/marketplace"}
                className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Marketplace
              </Link>
              <Link
                href={isHomePage ? "#features" : "/transparency"}
                className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Transparency
              </Link>

              {/* Mobile theme toggle */}
              <div className="px-3 py-2">
                <ThemeToggle />
              </div>

              {/* Mobile wallet button */}
              <div className="px-3 py-3 border-t border-slate-800/50">
                <EnhancedConnectButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
