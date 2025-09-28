'use client';

import { motion, useInView, useAnimation, Variants } from 'framer-motion';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatedBackground } from './ui/AnimatedBackground';

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
      when: "beforeChildren",
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  },
};

type SearchSuggestion = {
  id: string;
  text: string;
  icon: React.ReactNode;
};

export function Hero() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const controls = useAnimation();
  const heroRef = useRef<HTMLElement>(null);
  const isInView = useInView(heroRef, { once: true, amount: 0.2 });

  // Search suggestions
  const searchSuggestions: SearchSuggestion[] = [
    { id: 'music', text: 'Music', icon: '🎵' },
    { id: 'conference', text: 'Conference', icon: '🎤' },
    { id: 'workshop', text: 'Workshop', icon: '🎨' },
    { id: 'sports', text: 'Sports', icon: '⚽' },
  ];

  // Handle search submission
  const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/events?search=${encodeURIComponent(query)}`);
    }
  }, [searchQuery, router]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setSearchQuery(suggestion);
    // Trigger a small animation when selecting a suggestion
    controls.start({
      scale: [1, 1.05, 1],
      transition: { duration: 0.3 },
    });
  }, [controls]);

  // Animate in when in view
  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  return (
    <motion.section
      ref={heroRef}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950"
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      aria-labelledby="hero-heading"
    >
      {/* Animated background */}
      <AnimatedBackground />
      <div
        className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-950/90"
        aria-hidden="true"
      />

      <div className="container relative z-10 px-4 mx-auto text-center">
        {/* Main heading */}
        <motion.div
          variants={itemVariants}
          className="mb-8 md:mb-12"
        >
          <h1
            id="hero-heading"
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent"
          >
            Discover Amazing Events
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Experience the future of event ticketing with blockchain technology. Secure, transparent, and unforgettable experiences await.
          </p>
        </motion.div>

        {/* Search form */}
        <motion.form
          onSubmit={handleSearch}
          variants={itemVariants}
          className="max-w-2xl mx-auto mt-8 flex flex-col sm:flex-row gap-3"
          aria-label="Search events"
        >
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search events..."
              className="pl-10 pr-4 py-6 text-base bg-slate-800/50 border border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-full rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search events"
              required
            />
          </div>
          <button
            type="submit"
            className="px-6 py-6 text-base font-medium bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 active:scale-95 whitespace-nowrap rounded-md"
            aria-label="Search events"
          >
            Search
          </button>
        </motion.form>

        {/* Search suggestions */}
        <motion.div
          variants={itemVariants}
          className="mt-6 flex flex-wrap justify-center gap-3 text-slate-300 text-sm"
          role="list"
          aria-label="Popular event categories"
        >
          {searchSuggestions.map((suggestion) => (
            <motion.button
              key={suggestion.id}
              type="button"
              onClick={() => handleSuggestionClick(suggestion.text)}
              className="px-4 py-2 bg-slate-800/50 rounded-full backdrop-blur-sm hover:bg-slate-700/70 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              role="listitem"
              aria-label={`Search ${suggestion.text} events`}
            >
              <span aria-hidden="true">{suggestion.icon}</span>
              <span>{suggestion.text}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        aria-hidden="true"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="text-cyan-400"
          aria-hidden="true"
        >
          <path
            d="M7 10L12 15L17 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="sr-only">Scroll down</span>
      </motion.div>
    </motion.section>
  );
}
