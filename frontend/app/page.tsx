"use client";

import React from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEvents } from "./hooks/useEvents";
import EventCard from "./components/events/EventCard";
import { Event } from "../types/event";

const Home: React.FC = () => {
  const { data: events = [], isLoading: loading } = useEvents();
  const featuredEvents = events.slice(0, 3); // Show first 3 events as featured

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-slate-900"></div>
        
        {/* Content */}
        <div className="relative mx-auto max-w-7xl px-6">
          {/* Top label */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 text-cyan-400">
              <span className="text-red-500">🔗</span>
              <span className="text-sm font-medium">Blockchain-Native Events</span>
            </div>
          </div>
          
          {/* Large gradient rectangle - exactly matching the image */}
          <div className="h-48 w-full mb-12 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 shadow-2xl"></div>
          
          {/* Description */}
          <div className="text-center text-gray-300 max-w-4xl mx-auto mb-12">
            <p className="text-xl leading-relaxed">
              Join blockchain-verified events with NFT tickets, community rewards, and full transparency. Experience the future of event participation.
            </p>
          </div>
          
          {/* CTA buttons */}
          <div className="flex gap-4 justify-center">
            <Link
              href="/events"
              className="bg-cyan-500 text-black px-8 py-3 rounded-lg font-semibold hover:bg-cyan-400 transition-colors flex items-center gap-2"
            >
              ⚡ Explore Events
            </Link>
            <div className="border border-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer">
              ⭕ Connect Wallet
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12 max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Featured Events</h2>
              <p className="text-gray-400">Discover blockchain-native events with verified organizers and transparent operations.</p>
            </div>
            <Link
              href="/events"
              className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
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
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Blockchain Verified</h3>
              <p className="text-gray-400 leading-relaxed">
                All events are verified on-chain with immutable records and transparent operations.
              </p>
            </div>
            
            <div className="text-center bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Earn Rewards & Rewards</h3>
              <p className="text-gray-400 leading-relaxed">
                Get rewarded for participation with tokens, NFTs, and exclusive community benefits.
              </p>
            </div>
            
            <div className="text-center bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Community Driven</h3>
              <p className="text-gray-400 leading-relaxed">
                Connect with like-minded individuals in a decentralized event ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
