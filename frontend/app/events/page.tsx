"use client";

import React from "react";
import { useEvents } from "../hooks/useEvents";
import EventCard from "../components/events/EventCard";
import { Event } from "../../types/event";

const EventsPage: React.FC = () => {
  const { data: events = [], isLoading: loading } = useEvents();

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">All Events</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover blockchain-verified events with NFT tickets, community rewards, and full transparency.
          </p>
        </div>
      </section>

      {/* Events List */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading events...</p>
            </div>
          ) : events.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {events.map((event: Event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-6">🎪</div>
              <h2 className="text-2xl font-bold text-white mb-4">No Events Yet</h2>
              <p className="text-gray-400 mb-8">Be the first to create an event on our platform!</p>
              <a
                href="/events/create"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 font-semibold"
              >
                Create Event
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EventsPage;
