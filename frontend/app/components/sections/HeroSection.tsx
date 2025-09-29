'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import the heavy animation component on client only to speed up dev/server
const BlockchainAnimation = dynamic(() => import('../ui/BlockchainAnimation').then(m => m.BlockchainAnimation), {
  ssr: false,
  loading: () => null,
});

export function HeroSection() {
  return (
    <section id="hero" className="relative py-12 md:py-20 overflow-hidden min-h-[calc(100vh-4rem)] flex items-center">
      {/* Blockchain Animation Background */}
      <div className="absolute inset-0 bg-slate-900">
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

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200 group-hover:duration-300"></div>
            <Link
              href="/events"
              className="relative bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl transition-all duration-200 group-hover:from-cyan-500 group-hover:to-blue-500"
            >
              <span className="group-hover:animate-pulse">⚡</span>
              <span>Explore Events</span>
              <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">→</span>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/events/create"
              className="relative group bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700/50 text-white px-8 py-4 rounded-lg font-bold hover:bg-slate-700/30 transition-all duration-200 flex items-center justify-center gap-2 text-lg hover:border-cyan-400/30"
            >
              <span className="group-hover:animate-bounce">🎯</span>
              <span>Create Event</span>
              <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">+</span>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="sm:ml-2"
          >
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