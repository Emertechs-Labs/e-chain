'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import sections to improve initial load performance
const HeroSection = dynamic(() => import('./components/sections/HeroSection').then(m => m.HeroSection), {
  loading: () => <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div></div>
});
const FeaturedEventsSection = dynamic(() => import('./components/sections/FeaturedEventsSection').then(m => m.FeaturedEventsSection));
const FeaturesSection = dynamic(() => import('./components/sections/FeaturesSection').then(m => m.FeaturesSection));
const TestimonialsSection = dynamic(() => import('./components/sections/TestimonialsSection').then(m => m.TestimonialsSection));
const FAQSection = dynamic(() => import('./components/sections/FAQSection').then(m => m.FAQSection));
const CTASection = dynamic(() => import('./components/sections/CTASection').then(m => m.CTASection));
const FloatingActionButton = dynamic(() => import('./components/sections/FloatingActionButton').then(m => m.FloatingActionButton));

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <HeroSection />
      <FeaturedEventsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <FloatingActionButton />
    </div>
  );
};

export default Home;
