"use client";

import React, { useState, useMemo } from "react";
import { useEvents } from "../hooks/useEvents";
import { Event } from "../../types/event";
import EventCard from "../components/events/EventCard";
import { FiSearch, FiFilter } from 'react-icons/fi';
import Link from 'next/link';
import { ModernButton } from '../components/ui/ModernButton';
import { kenyaTechEvents } from '../../lib/mockEvents';

// Use the mock events from the shared lib
const mockEvents = kenyaTechEvents.map(event => ({
  ...event,
  ticketContract: event.ticketContract || "0x0000000000000000000000000000000000000000",
  metadataURI: event.metadataURI || "",
  isActive: event.isActive !== undefined ? event.isActive : true,
  createdAt: event.createdAt || Date.now() / 1000
}));

const EventsPage: React.FC = () => {
  const { data: blockchainEvents = [], isLoading: loading } = useEvents();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<'upcoming' | 'past'>('upcoming');
  
  // Combine blockchain events with mock Kenya tech events
  const allEvents = useMemo(() => {
    const combinedEvents = [...blockchainEvents, ...mockEvents] as Event[];
    return combinedEvents.sort((a, b) => a.startTime - b.startTime);
  }, [blockchainEvents]);

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = allEvents;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Filter by upcoming/past
    const now = Date.now() / 1000;
    if (viewMode === 'upcoming') {
      filtered = filtered.filter(event => event.endTime > now);
    } else {
      filtered = filtered.filter(event => event.endTime <= now);
    }

    return filtered;
  }, [allEvents, searchTerm, selectedCategory, viewMode]);


  const categories = ["All", "Hackathon", "Workshop", "Conference", "Summit", "Meetup", "Networking", "Bootcamp"];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header Section */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">All Events</h1>
            <p className="text-gray-400 max-w-2xl mx-auto mb-6">
              Discover blockchain-powered events in Kenya and beyond. Join hackathons, workshops, conferences, and networking events.
            </p>
            
            {/* Create Event Button */}
            <div className="flex justify-center">
              <Link 
                href="/events/create"
                className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-cyan-500/50 hover:scale-105 transform"
              >
                <span className="flex items-center gap-2">
                  <span>🎯</span>
                  <span>Create Event</span>
                </span>
              </Link>
            </div>
          </div>
            
          {/* Filters Section */}
          <div className="max-w-6xl mx-auto">

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            
              {/* View Toggle */}
              <div className="flex bg-slate-800/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('upcoming')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'upcoming' 
                      ? 'bg-cyan-500 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setViewMode('past')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'past' 
                      ? 'bg-cyan-500 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Past
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap justify-center">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
              <p className="mt-4 text-slate-400">Loading events...</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {filteredEvents.map((event: Event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🎪</div>
              <h2 className="text-2xl font-bold text-white mb-4">
                {searchTerm || selectedCategory !== "All" 
                  ? "No events found" 
                  : "No upcoming events"}
              </h2>
              <p className="text-slate-400 mb-8">
                {searchTerm || selectedCategory !== "All"
                  ? "Try adjusting your search or filters"
                  : "Be the first to create an event on our platform!"}
              </p>
              <Link href="/events/create">
                <ModernButton variant="gradient" size="lg" glow>
                  Create Event
                </ModernButton>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EventsPage;
