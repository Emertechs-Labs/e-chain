'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { 
  FiMenu, 
  FiX, 
  FiSearch, 
  FiUser, 
  FiBell,
  FiSettings,
  FiLogOut
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { cn } from '@/lib/utils';
import { ModernButton } from '../ui/ModernButton';

export const ModernNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { scrollY } = useScroll();
  
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const navItems = [
    { name: 'Events', href: '/events', badge: '12' },
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'My Tickets', href: '/my-tickets' },
    { name: 'Rewards', href: '/rewards', highlight: true },
  ];

  const userMenuItems = [
    { name: 'Profile', href: '/profile', icon: <FiUser /> },
    { name: 'Settings', href: '/settings', icon: <FiSettings /> },
    { name: 'Logout', href: '/logout', icon: <FiLogOut /> },
  ];

  return (
    <motion.nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled ? (
          'py-2 bg-slate-900/70 backdrop-blur-xl border-b border-slate-800/50 shadow-2xl'
        ) : (
          'py-4 bg-transparent'
        )
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center gap-2">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Echain
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'relative px-4 py-2 rounded-lg text-sm font-medium',
                    'text-slate-300 hover:text-white',
                    'transition-all duration-200',
                    'hover:bg-white/5',
                    item.highlight && 'text-cyan-400'
                  )}
                >
                  {item.name}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && (
                    <HiSparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-pulse" />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Search Bar */}
            <motion.div
              className={cn(
                'relative overflow-hidden rounded-lg transition-all duration-300',
                isSearchOpen ? 'w-64' : 'w-10'
              )}
            >
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="absolute left-0 top-0 p-2.5 text-slate-400 hover:text-white z-10"
              >
                <FiSearch className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder="Search events, tickets..."
                className={cn(
                  'w-full h-10 pl-10 pr-4 bg-slate-800/50 backdrop-blur-sm',
                  'border border-slate-700 rounded-lg',
                  'text-white placeholder-slate-500',
                  'focus:outline-none focus:border-cyan-500',
                  'transition-all duration-300',
                  !isSearchOpen && 'opacity-0 pointer-events-none'
                )}
              />
            </motion.div>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2.5 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
            >
              <FiBell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </motion.button>

            {/* User Menu */}
            <div className="relative group">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-semibold"
              >
                JD
              </motion.button>
              
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-48 py-2 bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-700/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
                {userMenuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <ModernButton variant="gradient" size="sm" glow>
              Create Event
            </ModernButton>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-800/50 text-white"
          >
            {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{
            height: isOpen ? 'auto' : 0,
            opacity: isOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="lg:hidden overflow-hidden"
        >
          <div className="pt-4 pb-2 space-y-2">
            {/* Mobile Search */}
            <div className="relative mb-4">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Mobile Nav Items */}
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center justify-between px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all"
                onClick={() => setIsOpen(false)}
              >
                <span className={cn(item.highlight && 'text-cyan-400')}>
                  {item.name}
                </span>
                {item.badge && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}

            {/* Mobile CTA */}
            <div className="pt-4">
              <ModernButton variant="gradient" fullWidth>
                Create Event
              </ModernButton>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Bar (Optional) */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"
        style={{
          width: `${Math.min((scrollY.get() / (document.body.scrollHeight - window.innerHeight)) * 100, 100)}%`,
        }}
      />
    </motion.nav>
  );
};
