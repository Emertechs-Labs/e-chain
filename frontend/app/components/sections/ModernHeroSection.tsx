'use client';

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ModernButton } from '../ui/ModernButton';
import { ModernCard } from '../ui/ModernCard';
import { 
  FiArrowRight, 
  FiPlay, 
  FiShield, 
  FiZap, 
  FiGlobe,
  FiTrendingUp 
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import Link from 'next/link';

export const ModernHeroSection: React.FC = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  const [currentStat, setCurrentStat] = useState(0);
  const stats = [
    { value: '12K+', label: 'Events Created' },
    { value: '234K+', label: 'NFT Tickets' },
    { value: '987K+', label: 'Happy Attendees' },
    { value: '99.9%', label: 'Uptime' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stats.length]);

  const features = [
    { icon: <FiShield />, text: 'Secure & Transparent' },
    { icon: <FiZap />, text: 'Lightning Fast' },
    { icon: <FiGlobe />, text: 'Global Access' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black" />
        
        {/* Animated Gradient Orbs */}
        <motion.div
          style={{ y }}
          className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          style={{ y }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Dots Pattern */}
        <div className="absolute inset-0 dots-pattern opacity-20" />
        
        {/* Grid Pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <motion.div
        style={{ opacity }}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-full"
        >
          <HiSparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-cyan-400">
            Powered by Base & Leading Blockchains
          </span>
          <HiSparkles className="w-4 h-4 text-cyan-400" />
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6"
        >
          <span className="block text-white">The Future of</span>
          <span className="block mt-2 animated-gradient-text">
            Event Ticketing
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-400 mb-8 max-w-3xl mx-auto"
        >
          Create unforgettable experiences with blockchain-powered events, 
          NFT tickets, and exclusive POAP rewards.
        </motion.p>

        {/* Features Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-6 mb-10"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-slate-300"
            >
              <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                {feature.icon}
              </div>
              <span className="text-sm font-medium">{feature.text}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <Link href="/events/create">
            <ModernButton 
              variant="gradient" 
              size="lg" 
              icon={<FiArrowRight />} 
              iconPosition="right"
              glow
            >
              Start Creating Events
            </ModernButton>
          </Link>
          
          <ModernButton 
            variant="glass" 
            size="lg" 
            icon={<FiPlay />}
            iconPosition="left"
          >
            Watch Demo
          </ModernButton>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {stats.map((stat, index) => (
            <ModernCard
              key={index}
              variant="glass"
              padding="sm"
              hover={false}
              className={cn(
                'text-center transition-all duration-500',
                currentStat === index && 'scale-105 border-cyan-500/50'
              )}
            >
              <motion.div
                animate={{
                  scale: currentStat === index ? [1, 1.1, 1] : 1,
                }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </motion.div>
            </ModernCard>
          ))}
        </motion.div>

        {/* Live Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 inline-flex items-center gap-2 text-sm text-slate-400"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span>Live on Mainnet</span>
          <FiTrendingUp className="w-4 h-4 text-green-400" />
        </motion.div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 floating">
          <ModernCard variant="glass" padding="sm" className="backdrop-blur-xl">
            <p className="text-xs text-cyan-400">NFT Ticket #2837</p>
          </ModernCard>
        </div>
        
        <div className="absolute bottom-20 right-10 floating animation-delay-2000">
          <ModernCard variant="glass" padding="sm" className="backdrop-blur-xl">
            <p className="text-xs text-purple-400">POAP Claimed ✓</p>
          </ModernCard>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-slate-400 rounded-full mt-2 animate-bounce" />
        </div>
      </motion.div>
    </section>
  );
};

// Helper function for conditional classes
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
