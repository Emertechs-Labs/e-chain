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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to Echain Events</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover, create, and manage blockchain-powered events with NFT tickets and POAP rewards
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/events"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Browse Events
            </Link>
            <Link
              href="/events/create"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Create Event
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Events</h2>
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading events...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
          {!loading && featuredEvents.length === 0 && (
            <div className="text-center">
              <p className="text-gray-600 mb-4">No events available yet.</p>
              <Link
                href="/events/create"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create the First Event
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Echain Events?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">🎫</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">NFT Tickets</h3>
              <p className="text-gray-600">
                Every ticket is a unique NFT that proves ownership and can be traded on secondary markets.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">POAP Rewards</h3>
              <p className="text-gray-600">
                Collect proof of attendance NFTs for events you've attended to build your event history.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">🎁</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Incentive System</h3>
              <p className="text-gray-600">
                Earn rewards for attending events regularly and being an active community member.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
