 'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAccount } from 'wagmi';

// Dynamically import the heavy animation component on client only to speed up dev/server
const BlockchainAnimation = dynamic(() => import('../ui/BlockchainAnimation').then(m => m.BlockchainAnimation), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 animate-pulse"></div>
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-400/30 rounded-full blur-xl animate-bounce"></div>
      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-400/30 rounded-full blur-xl animate-bounce delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-500"></div>
    </div>
  ),
});

export function HeroSection() {
  // Navbar contains the wallet connect UI; hero should not duplicate it
  const { isConnected } = useAccount();

  function VideoBackground() {
    const [hasVideo, setHasVideo] = useState(false);

    useEffect(() => {
      // Only attempt to load a video if an external URL is provided at build time
      const videoUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL;
      if (!videoUrl) {
        setHasVideo(false);
        return;
      }

      // Avoid loading on small screens or slow networks
      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
      const connection = (navigator as any).connection;
      const effectiveType = connection?.effectiveType || '4g';
      const isFastNetwork = ['4g', '5g', 'wifi'].includes(effectiveType);

      if (!isDesktop || !isFastNetwork) {
        setHasVideo(false);
        return;
      }

      let mounted = true;
      // quick HEAD request to check existence and avoid heavy download
      fetch(videoUrl, { method: 'HEAD' })
        .then((res) => {
          if (!mounted) return;
          setHasVideo(res.ok);
        })
        .catch(() => {
          if (!mounted) return;
          setHasVideo(false);
        });

      return () => {
        mounted = false;
      };
    }, []);

    if (!hasVideo) return null;

    const videoUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL as string;
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <video
          className="w-full h-full object-cover opacity-30"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      </div>
    );
  }

  return (
    // Force hero to fit within one viewport minus header (header ~4rem)
    <section id="hero" className="relative py-8 md:py-12 overflow-hidden h-[calc(100vh-4rem)] flex items-center">
      <div className="absolute inset-0 bg-slate-900">
        {/* Optional video background (place a file at public/videos/hero-bg.mp4). If present it will be used; otherwise the animation will be visible. */}
        <VideoBackground />
        <BlockchainAnimation />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/80"></div>

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,_#0f172a_70%)]"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>

        {/* Floating Shapes */}
        <div className="absolute top-32 left-20 w-4 h-4 bg-cyan-400 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-48 right-32 w-6 h-6 bg-blue-400 rounded-lg rotate-45 animate-spin-slow delay-700"></div>
        <div className="absolute bottom-40 left-32 w-3 h-3 bg-purple-400 rounded-full animate-ping delay-1000"></div>
        <div className="absolute top-64 right-20 w-5 h-5 bg-pink-400 rounded-full animate-bounce delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-6 z-10">
        {/* Hero Title and Description */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-cyan-400 text-2xl">🚀</span>
            <span className="text-sm font-medium text-cyan-400 tracking-wider uppercase">The Future of Events is Here</span>
          </motion.div>
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
              Decentralized
            </span>
            <span className="block text-white">Event Platform</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Experience the next generation of event ticketing with blockchain technology.
            Secure, transparent, and community-powered events await you.
          </motion.p>

          {/* Trust Indicators */}
          <motion.div
            className="flex flex-wrap justify-center items-center gap-6 mb-10 text-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.div
              className="flex items-center gap-2 bg-slate-800/30 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700/50"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-green-400 font-medium">100% Decentralized</span>
            </motion.div>

            <motion.div
              className="flex items-center gap-2 bg-slate-800/30 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700/50"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
            >
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              <span className="text-blue-400 font-medium">Immutable Records</span>
            </motion.div>

            <motion.div
              className="flex items-center gap-2 bg-slate-800/30 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700/50"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
            >
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
              <span className="text-purple-400 font-medium">NFT Rewards</span>
            </motion.div>
          </motion.div>
        </div>

        {/* CTA Buttons: removed redundant Connect Wallet (navbar provides it). Keep primary navigation CTAs compact to fit viewport */}
        <motion.div
          className="flex flex-wrap gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/events"
              className="relative bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 text-base shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <span>⚡</span>
              <span>Explore Events</span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/events/create"
              className="relative group bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700/50 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-700/30 transition-all duration-200 flex items-center justify-center gap-2 text-base"
            >
              <span>🎯</span>
              <span>Create Event</span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <a
              href="#features"
              className="group flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium px-4 py-2"
            >
              <span>Learn more</span>
              <span className="group-hover:translate-x-1 transition-transform">↓</span>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}