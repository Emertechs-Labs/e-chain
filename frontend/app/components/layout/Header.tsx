'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { EnhancedConnectButton } from '../EnhancedConnectButton';
import { ThemeToggle } from '../ThemeToggle';
import { usePendingTransactions } from '../TransactionStatus';
import { Clock, Home, User, LogOut } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/';

  // Redirect to dashboard after wallet connection (only from home page)
  useEffect(() => {
    if (isConnected && pathname === '/') {
      router.push('/my-events');
    }
  }, [isConnected, pathname, router]);

  // Handle wallet disconnection - redirect to home
  const handleDisconnect = () => {
    disconnect();
    router.push('/');
  };

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
              <Image
                src="/placeholder.svg"
                alt="Echain Logo"
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg"
              />
              <span className="ml-2 text-xl font-bold gradient-text">
                Echain
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {isConnected ? (
              // Connected user navigation
              <>
                <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                  <Home className="w-4 h-4 mr-1" />
                  Home
                </Link>
                <Link href="/events" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                  Events
                </Link>
                <Link href="/events/create" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                  Create Event
                </Link>
                <Link href="/my-events" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                  My Events
                </Link>
                <Link href="/my-tickets" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                  My Tickets
                </Link>
                <Link href="/poaps" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                  POAPs
                </Link>
                <Link href="/rewards" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                  Rewards
                </Link>
                <Link href="/marketplace" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                  Marketplace
                </Link>

                {/* User info and disconnect */}
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-border/50">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="w-4 h-4 mr-1" />
                    <span className="font-mono">
                      {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                    </span>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center text-muted-foreground hover:text-red-400 text-sm font-medium transition-colors"
                    title="Disconnect Wallet"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              // Unconnected user navigation
              <>
                <Link href="/" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                  Home
                </Link>
                <Link href="/#events" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                  Events
                </Link>
                <Link href="/#features" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                  Features
                </Link>
                <Link href="/#faq" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                  FAQ
                </Link>
                <Link href="/marketplace" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                  Marketplace
                </Link>
                <Link href="/transparency" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                  Transparency
                </Link>
              </>
            )}

            {/* Theme Toggle */}
            <div className="ml-2">
              <ThemeToggle />
            </div>

            {/* Connect Wallet - only show when not connected */}
            {!isConnected && (
              <div className="ml-4">
                <EnhancedConnectButton />
              </div>
            )}
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
              {isConnected ? (
                // Mobile connected navigation
                <>
                  <Link
                    href="/"
                    className="flex items-center text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Link>
                  <Link
                    href="/events"
                    className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Events
                  </Link>
                  <Link
                    href="/events/create"
                    className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Event
                  </Link>
                  <Link
                    href="/my-events"
                    className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Events
                  </Link>
                  <Link
                    href="/my-tickets"
                    className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Tickets
                  </Link>
                  <Link
                    href="/poaps"
                    className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    POAPs
                  </Link>
                  <Link
                    href="/rewards"
                    className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Rewards
                  </Link>
                  <Link
                    href="/marketplace"
                    className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Marketplace
                  </Link>

                  {/* Mobile user info and disconnect */}
                  <div className="px-3 py-3 border-t border-slate-800/50 mt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="w-4 h-4 mr-2" />
                        <span className="font-mono">
                          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          handleDisconnect();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center text-muted-foreground hover:text-red-400 text-sm font-medium transition-colors"
                        title="Disconnect Wallet"
                      >
                        <LogOut className="w-4 h-4 mr-1" />
                        Disconnect
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // Mobile unconnected navigation
                <>
                  <Link
                    href="/"
                    className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/#events"
                    className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Events
                  </Link>
                  <Link
                    href="/#features"
                    className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href="/#faq"
                    className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    FAQ
                  </Link>
                  <Link
                    href="/marketplace"
                    className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Marketplace
                  </Link>
                  <Link
                    href="/transparency"
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
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
