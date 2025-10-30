'use client';

/// <reference types="next" />
import Link from 'next/link';
import { useEvents } from '../../hooks/useEvents';
import EventCard from '../events/EventCard';
import { Event } from '../../../types/event';

export function FeaturedEventsSection() {
  const { data: events = [], isLoading: loading, refetch } = useEvents();

  // Show only first 3 events as featured
  const featuredEvents = events.slice(0, 3);

  return (
    <section id="events" className="py-6 md:py-8 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 md:mb-6 max-w-6xl mx-auto gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Featured Events</h2>
            <p className="text-gray-400">Discover blockchain-native events with verified organizers and transparent operations.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => refetch()}
              className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 transition-colors text-sm"
            >
              Refresh Events
            </button>
            <Link
              href="/events"
              className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700 w-full sm:w-auto text-center"
            >
              View All Events
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading events...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
  );
}