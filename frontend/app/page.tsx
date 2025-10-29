'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import sections to improve initial load performance
const HeroSection = dynamic(() => import('./components/sections/HeroSection').then(m => m.HeroSection), {
  loading: () => <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div></div>
});
const FeaturedEventsSection = dynamic(() => import('./components/sections/FeaturedEventsSection').then(m => m.FeaturedEventsSection));
const StatsSection = dynamic(() => import('./components/sections/StatsSection').then(m => m.StatsSection));
const FeaturesSection = dynamic(() => import('./components/sections/FeaturesSection').then(m => m.FeaturesSection));
const BlockchainSection = dynamic(() => import('./components/sections/BlockchainSection').then(m => m.BlockchainSection));
const TestimonialsSection = dynamic(() => import('./components/sections/TestimonialsSection').then(m => m.TestimonialsSection));
const FAQSection = dynamic(() => import('./components/sections/FAQSection').then(m => m.FAQSection));
const CTASection = dynamic(() => import('./components/sections/CTASection').then(m => m.CTASection));
const FloatingActionButton = dynamic(() => import('./components/sections/FloatingActionButton').then(m => m.FloatingActionButton));

const Home: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Minimal loading time to prevent flash
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100); // Reduced to 100ms

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center transition-opacity duration-500">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500/20 border-t-cyan-500"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin animation-delay-300"></div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to Echain</h2>
            <p className="text-cyan-400 text-lg">Initializing your decentralized experience...</p>
          </div>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <StatsSection />
      <FeaturedEventsSection />
      <FeaturesSection />
      <BlockchainSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <FloatingActionButton />
    </div>
  );
};

export default Home;
