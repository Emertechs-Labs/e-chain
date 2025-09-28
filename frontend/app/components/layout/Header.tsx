'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href={isHomePage ? "#events" : "/events"} className="text-gray-300 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-800">
              Events
            </Link>
            {isConnected && (
              <Link href="/events/create" className="text-gray-300 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-800">
                Create Event
              </Link>
            )}
            <Link href={isHomePage ? "#features" : "/marketplace"} className="text-gray-300 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-800">
              Marketplace
            </Link>
            <Link href={isHomePage ? "#features" : "/transparency"} className="text-gray-300 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-800">
              Transparency
            </Link>
          </nav>
          
          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events..."
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-64"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Profile Icon - only show when connected */}
            {isConnected && (
              <button className="text-gray-300 hover:text-white p-2 rounded-md transition-colors">
                <span className="text-lg">👤</span>
                <span className="ml-2 text-sm hidden lg:inline">Profile</span>
              </button>
            )}
            
            {/* Connect Wallet Button - make it more prominent */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg p-1">
              <ConnectButton />
            </div>
            
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-800"
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
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-slate-800 bg-slate-900">
              {visibleNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={isHomePage && item.name === 'Events' ? '#events' : item.href}
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-slate-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href={isHomePage ? "#features" : "/marketplace"}
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-slate-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Marketplace
              </Link>
              <Link
                href={isHomePage ? "#features" : "/transparency"}
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-slate-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Transparency
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
