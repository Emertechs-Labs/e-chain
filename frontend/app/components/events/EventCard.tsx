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
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Event Image Placeholder */}
      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-6xl font-bold opacity-20">
          {event.name.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="p-6">
        {/* Event Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900 truncate">
            {event.name}
          </h3>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              event.isActive && !isEventEnded
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {event.isActive && !isEventEnded ? 'Active' : 'Ended'}
          </span>
        </div>

        {/* Event Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-600">
            <span className="text-sm mr-2">🎫</span>
            <span className="text-sm">
              {ticketPriceInEth} ETH per ticket
            </span>
          </div>

          <div className="flex items-center text-gray-600">
            <span className="text-sm mr-2">👥</span>
            <span className="text-sm">
              Max {event.maxTickets.toLocaleString()} tickets
            </span>
          </div>

          <div className="flex items-center text-gray-600">
            <span className="text-sm mr-2">📅</span>
            <span className="text-sm">
              Sales end: {new Date(event.saleEndTime * 1000).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Organizer */}
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            Organizer: {event.organizer.slice(0, 6)}...{event.organizer.slice(-4)}
          </p>
        </div>

        {/* Action Button */}
        <Link
          href={`/events/${event.id}`}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium text-center block hover:bg-blue-700 transition-colors"
        >
          View Event
        </Link>
      </div>
    </div>
  );
}
