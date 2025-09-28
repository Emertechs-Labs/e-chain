'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEvents } from './hooks/useEvents';
import EventCard from './components/events/EventCard';
import { Event } from '../types/event';
import { BlockchainAnimation } from './components/ui/BlockchainAnimation';

const Home: React.FC = () => {
  const { data: events = [], isLoading: loading } = useEvents();
  const featuredEvents = events.slice(0, 3); // Show first 3 events as featured
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <section id="hero" className="relative py-12 md:py-20 overflow-hidden min-h-screen flex items-center">
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

      {/* Featured Events */}
      <section id="events" className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 md:mb-12 max-w-6xl mx-auto gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Featured Events</h2>
              <p className="text-gray-400">Discover blockchain-native events with verified organizers and transparent operations.</p>
            </div>
            <Link
              href="/events"
              className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700 w-full sm:w-auto text-center"
            >
              View All Events
            </Link>
          </div>

          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading events...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {featuredEvents.map((event: Event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
          {!loading && featuredEvents.length === 0 && (
            <div className="text-center">
              <p className="text-gray-400 mb-4">No events available yet.</p>
              <Link
                href="/events/create"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-200"
              >
                Create the First Event
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-16 bg-slate-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 border border-cyan-400 rounded-full animate-spin-very-slow"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border border-purple-400 rounded-lg rotate-45 animate-pulse"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 text-cyan-400">
              <span className="text-2xl">🚀</span>
              <span className="text-sm font-medium tracking-wider uppercase">Why Choose Echain</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Next-Gen Event
              <span className="block bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                Technology
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience the future of event ticketing with cutting-edge blockchain technology and Web3 innovation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group relative bg-slate-800/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-3xl">🛡️</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-cyan-300 transition-colors">Blockchain Verified</h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  All events are verified on-chain with immutable records and transparent operations. No more fake tickets or scalping.
                </p>
                <div className="mt-6 flex items-center text-cyan-400 group-hover:text-cyan-300 transition-colors">
                  <span className="text-sm font-medium">Learn more</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>

            <div className="group relative bg-slate-800/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-700 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-3xl">🎁</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-blue-300 transition-colors">NFT Rewards & POAPs</h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  Earn exclusive NFT collectibles and POAP badges for attending events. Build your Web3 reputation and showcase achievements.
                </p>
                <div className="mt-6 flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
                  <span className="text-sm font-medium">Learn more</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>

            <div className="group relative bg-slate-800/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-700 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-3xl">🌐</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-purple-300 transition-colors">Decentralized Community</h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  Join a global community of event enthusiasts. Connect with like-minded individuals in a censorship-resistant ecosystem.
                </p>
                <div className="mt-6 flex items-center text-purple-400 group-hover:text-purple-300 transition-colors">
                  <span className="text-sm font-medium">Learn more</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-20 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 text-green-400">
              <span className="text-2xl">💬</span>
              <span className="text-sm font-medium tracking-wider uppercase">Success Stories</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              What Our Community Says
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 hover:border-green-500/50 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">A</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Alex Chen</div>
                  <div className="text-gray-400 text-sm">Event Organizer</div>
                </div>
              </div>
              <div className="text-gray-300 mb-4">
                "Echain revolutionized how I run events. The NFT tickets and transparent transactions gave my attendees peace of mind."
              </div>
              <div className="flex text-yellow-400">
                ★★★★★
              </div>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">S</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Sarah Johnson</div>
                  <div className="text-gray-400 text-sm">Attendee</div>
                </div>
              </div>
              <div className="text-gray-300 mb-4">
                "Finally, event tickets that I can trust! The POAP rewards make attending events even more exciting."
              </div>
              <div className="flex text-yellow-400">
                ★★★★★
              </div>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 hover:border-purple-500/50 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">M</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Marcus Rodriguez</div>
                  <div className="text-gray-400 text-sm">Web3 Developer</div>
                </div>
              </div>
              <div className="text-gray-300 mb-4">
                "The transparency and security of blockchain-based ticketing is exactly what the industry needed."
              </div>
              <div className="flex text-yellow-400">
                ★★★★★
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">10K+</div>
              <div className="text-gray-400">Events Created</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">50K+</div>
              <div className="text-gray-400">Tickets Sold</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">25K+</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-pink-400 mb-2">$2M+</div>
              <div className="text-gray-400">Volume Traded</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 text-orange-400">
              <span className="text-2xl">❓</span>
              <span className="text-sm font-medium tracking-wider uppercase">Frequently Asked</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Got Questions?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Everything you need to know about blockchain event ticketing
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: "How do NFT tickets work?",
                answer: "NFT tickets are unique digital assets stored on the blockchain. Each ticket contains event details, seat information, and ownership verification. They're transferable, verifiable, and cannot be duplicated or counterfeited."
              },
              {
                question: "Are my tickets secure?",
                answer: "Absolutely. All tickets are minted as NFTs on the blockchain, making them immutable and tamper-proof. You maintain full ownership and can transfer them securely to anyone."
              },
              {
                question: "What are POAP rewards?",
                answer: "POAP (Proof of Attendance Protocol) rewards are special NFTs you earn by attending events. They serve as digital badges that prove your participation and can be collected in your wallet."
              },
              {
                question: "How do I get started?",
                answer: "Simply connect your wallet, browse events, and purchase tickets with cryptocurrency. The process is seamless and takes just a few minutes."
              },
              {
                question: "What blockchains are supported?",
                answer: "We currently support Ethereum and compatible networks. More blockchain integrations are coming soon to provide even more options for our users."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-700/50 transition-colors"
                >
                  <span className="text-lg font-semibold text-white">{faq.question}</span>
                  <span className={`text-2xl text-cyan-400 transition-transform duration-300 ${openFaq === index ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-6 pt-0 text-gray-400 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Experience the Future?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of users already creating and attending blockchain-powered events
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/events"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all duration-200"
            >
              Get Started Today
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <div className="relative group">
          <button className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-110 flex items-center justify-center">
            <span className="text-2xl">⚡</span>
          </button>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Quick Actions
          </div>

          {/* Action Menu */}
          <div className="absolute bottom-full right-0 mb-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <div className="bg-slate-800 rounded-2xl p-2 shadow-2xl border border-slate-700 min-w-48">
              <Link
                href="/events"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 transition-colors text-white"
              >
                <span className="text-cyan-400">🔍</span>
                <span>Explore Events</span>
              </Link>
              <Link
                href="/events/create"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 transition-colors text-white"
              >
                <span className="text-purple-400">🎯</span>
                <span>Create Event</span>
              </Link>
              <Link
                href="/marketplace"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 transition-colors text-white"
              >
                <span className="text-green-400">🛒</span>
                <span>Marketplace</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
