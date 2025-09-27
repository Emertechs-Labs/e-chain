'use client';

import { Event } from '../../../types/event';
import { formatEther } from 'viem';
import Link from 'next/link';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const isEventEnded = event.saleEndTime * 1000 < Date.now();
  const ticketPriceInEth = formatEther(event.ticketPrice);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-slate-600 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-cyan-500/10">
      {/* Event Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 flex items-center justify-center relative">
        <div className="text-white/30 text-6xl font-bold">
          {event.name.charAt(0).toUpperCase()}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
      </div>

      <div className="p-6">
        {/* Event Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-white truncate">
            {event.name}
          </h3>
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              event.isActive && !isEventEnded
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {event.isActive && !isEventEnded ? 'Active' : 'Ended'}
          </span>
        </div>

        {/* Event Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-300">
            <span className="text-sm mr-2">🎫</span>
            <span className="text-sm">
              {ticketPriceInEth} ETH per ticket
            </span>
          </div>

          <div className="flex items-center text-gray-300">
            <span className="text-sm mr-2">👥</span>
            <span className="text-sm">
              Max {event.maxTickets.toLocaleString()} tickets
            </span>
          </div>

          <div className="flex items-center text-gray-300">
            <span className="text-sm mr-2">📅</span>
            <span className="text-sm">
              Sales end: {new Date(event.saleEndTime * 1000).toLocaleDateString()}
            </span>
          </div>

          {event.venue && (
            <div className="flex items-center text-gray-300">
              <span className="text-sm mr-2">📍</span>
              <span className="text-sm">{event.venue}</span>
            </div>
          )}

          {event.category && (
            <div className="flex items-center">
              <span className="text-sm mr-2">🏷️</span>
              <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
                {event.category}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Organizer */}
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            Organizer: {event.organizer.slice(0, 6)}...{event.organizer.slice(-4)}
          </p>
        </div>

        {/* Action Button */}
        <Link
          href={`/events/${event.id}`}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 px-4 rounded-lg font-medium text-center block hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 shadow-lg shadow-cyan-500/25"
        >
          View Event
        </Link>
      </div>
    </div>
  );
}
