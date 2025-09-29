'use client';

/// <reference types="next" />
import Link from 'next/link';
import { useState } from 'react';
import { useEvents } from '../../hooks/useEvents';
import EventCard from '../events/EventCard';
import { Event } from '../../../types/event';

// Mock data for initial display
const mockEvents: Event[] = [
  {
    id: 1,
    name: "Web3 Developer Conference 2024",
    organizer: "0x1234567890123456789012345678901234567890",
    ticketContract: "0x1111111111111111111111111111111111111111",
    metadataURI: "ipfs://QmWeb3Dev2024",
    ticketPrice: BigInt("100000000000000000"), // 0.1 ETH in wei
    maxTickets: 1200,
    startTime: Math.floor(new Date('2024-03-15T09:00:00').getTime() / 1000),
    endTime: Math.floor(new Date('2024-03-15T17:00:00').getTime() / 1000),
    isActive: true,
    createdAt: Math.floor(new Date('2024-01-01T00:00:00').getTime() / 1000),
    description: "The premier blockchain development conference featuring the latest in DeFi, NFTs, and decentralized technologies.",
    venue: "San Francisco, CA",
    category: "Early Bird"
  },
  {
    id: 2,
    name: "DeFi Summit: Future of Finance",
    organizer: "0x2345678901234567890123456789012345678901",
    ticketContract: "0x2222222222222222222222222222222222222222",
    metadataURI: "ipfs://QmDefiSummit2024",
    ticketPrice: BigInt("80000000000000000"), // 0.08 ETH in wei
    maxTickets: 800,
    startTime: Math.floor(new Date('2024-03-22T10:00:00').getTime() / 1000),
    endTime: Math.floor(new Date('2024-03-22T18:00:00').getTime() / 1000),
    isActive: true,
    createdAt: Math.floor(new Date('2024-01-15T00:00:00').getTime() / 1000),
    description: "Explore the cutting-edge developments in decentralized finance with industry leaders and innovators.",
    venue: "New York, NY",
    category: "Verified"
  },
  {
    id: 3,
    name: "NFT Art & Culture Festival",
    organizer: "0x3456789012345678901234567890123456789012",
    ticketContract: "0x3333333333333333333333333333333333333333",
    metadataURI: "ipfs://QmNFTFestival2024",
    ticketPrice: BigInt("50000000000000000"), // 0.05 ETH in wei
    maxTickets: 500,
    startTime: Math.floor(new Date('2024-04-05T14:00:00').getTime() / 1000),
    endTime: Math.floor(new Date('2024-04-05T22:00:00').getTime() / 1000),
    isActive: true,
    createdAt: Math.floor(new Date('2024-02-01T00:00:00').getTime() / 1000),
    description: "A celebration of digital art, NFT culture, and the creators shaping the metaverse of tomorrow.",
    venue: "Los Angeles, CA",
    category: "Art"
  }
];

export function FeaturedEventsSection() {
  const [useLiveData, setUseLiveData] = useState(false);
  const { data: liveEvents = [], isLoading: loading, refetch } = useEvents();

  // Use live data if available and requested, otherwise use mock data
  const events = useLiveData && liveEvents.length > 0 ? liveEvents : mockEvents;
  const featuredEvents = events.slice(0, 3);

  const handleLoadLiveData = async () => {
    setUseLiveData(true);
    await refetch();
  };

  return (
    <section id="events" className="py-6 md:py-8 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 md:mb-6 max-w-6xl mx-auto gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Featured Events</h2>
            <p className="text-gray-400">Discover blockchain-native events with verified organizers and transparent operations.</p>
          </div>
          <div className="flex gap-2">
            {!useLiveData && (
              <button
                onClick={handleLoadLiveData}
                className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 transition-colors text-sm"
              >
                Load Live Events
              </button>
            )}
            <Link
              href="/events"
              className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700 w-full sm:w-auto text-center"
            >
              View All Events
            </Link>
          </div>
        </div>

        {loading && useLiveData ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading live events...</p>
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