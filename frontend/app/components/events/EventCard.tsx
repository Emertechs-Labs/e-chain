 'use client';

import { useEffect, useRef } from 'react';
import { Event } from '../../../types/event';
import { formatEther } from 'viem';
import Link from 'next/link';
import Image from 'next/image';
import { getOrganizerDisplayName, formatEventDate, generateDefaultMetadata } from '../../../lib/metadata';
import { useEventTicketsSold } from '../../hooks/useTickets';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const isEventEnded = event.endTime * 1000 < Date.now();
  const ticketPriceInEth = formatEther(event.ticketPrice);
  
  // Get real ticket sales data
  const { data: ticketsSold = 0 } = useEventTicketsSold(event.id, event.ticketContract);
  
  const soldPercentage = event.maxTickets > 0 ? (ticketsSold / event.maxTickets) * 100 : 0;
  const progressRef = useRef<HTMLDivElement | null>(null);

  // Generate default metadata if event doesn't have proper description/venue
  const defaultMetadata = generateDefaultMetadata(event);
  const displayDescription = event.description || defaultMetadata.description;
  const displayVenue = event.venue || defaultMetadata.venue;
  const displayCategory = event.category || defaultMetadata.category;
  const organizerName = getOrganizerDisplayName(event);

  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    // Set width after mount so the tailwind transition animates
    const width = `${Math.min(Math.round(soldPercentage || 0), 100)}%`;
    // Use requestAnimationFrame to ensure this runs after paint
    requestAnimationFrame(() => {
      el.style.width = width;
    });
  }, [soldPercentage]);

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:scale-[1.02]">
      {/* Event Image/Banner */}
      <div className="h-40 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 relative">
        {/* Background image from metadata if available */}
        {(event.image || event.imageUrl) && (
          <Image 
            src={event.image || event.imageUrl || ''} 
            alt={event.name}
            fill
            className="object-cover"
            unoptimized={true} // Allow external URLs including blob storage
            onError={(e) => {
              // Hide broken images and fall back to gradient
              console.warn('Failed to load event image:', event.image || event.imageUrl);
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20"></div>
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            ✓ Verified
          </span>
          <span className="bg-slate-800/80 text-cyan-400 px-3 py-1 rounded-full text-xs font-medium">
            {displayCategory}
          </span>
          <span className="bg-slate-800/80 text-purple-400 px-3 py-1 rounded-full text-xs font-medium">
            Limited NFT
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span className="bg-cyan-500 text-slate-900 px-3 py-1 rounded-full text-sm font-bold">
            {ticketPriceInEth} ETH
          </span>
        </div>
        {/* Default emoji icon when no image available */}
        {!(event.image || event.imageUrl) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl">🎪</div>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-2">{event.name}</h3>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
          {displayDescription}
        </p>
        
        {/* Event Details */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center text-sm text-gray-400">
            <span className="text-cyan-400 mr-2">📅</span>
            {formatEventDate(event.startTime)}
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <span className="text-cyan-400 mr-2">📍</span>
            {displayVenue}
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <span className="text-cyan-400 mr-2">👥</span>
            {event.maxTickets.toLocaleString()} expected attendees
          </div>
        </div>
        
        {/* Ticket Sales Progress */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400">Tickets sold</span>
            <span className="text-xs font-bold text-cyan-400">
              {ticketsSold.toLocaleString()}/{event.maxTickets.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div
              ref={progressRef}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-300 w-0"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{Math.round(soldPercentage)}% sold</span>
            <span>{Math.round(100 - soldPercentage)}% left</span>
          </div>
        </div>
        
        {/* Organizer */}
        <div className="mb-3 pb-3 border-b border-slate-700">
          <span className="text-xs text-gray-500">Organized by</span>
          <div className="text-sm text-white font-medium">{organizerName}</div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            href={`/events/${event.id}`}
            className="flex-1 bg-cyan-500 text-slate-900 text-center py-2.5 rounded-lg hover:bg-cyan-400 transition-colors font-bold flex items-center justify-center gap-1 text-sm"
          >
            🎫 Get NFT Ticket
          </Link>
          <button className="p-2.5 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors">
            <span className="text-gray-400">↗</span>
          </button>
        </div>
      </div>
    </div>
  );
}
