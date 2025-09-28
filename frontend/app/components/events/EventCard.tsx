'use client';

import { Event } from '../../../types/event';
import { formatEther } from 'viem';
import Link from 'next/link';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const isEventEnded = event.endTime * 1000 < Date.now();
  const ticketPriceInEth = formatEther(event.ticketPrice);
  
  // Calculate ticket sales progress (mock data for demo)
  const ticketsSold = Math.floor(Math.random() * event.maxTickets);
  const soldPercentage = (ticketsSold / event.maxTickets) * 100;

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:scale-[1.02]">
      {/* Event Image/Banner */}
      <div className="h-48 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20"></div>
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            ✓ Verified
          </span>
          <span className="bg-slate-800/80 text-cyan-400 px-3 py-1 rounded-full text-xs font-medium">
            {event.category || 'Conference'}
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
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl">🎪</div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {event.description || 'A premier blockchain development conference featuring the latest in DeFi, NFTs, and decentralized technologies.'}
        </p>
        
        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-400">
            <span className="text-cyan-400 mr-2">📅</span>
            {new Date(event.endTime * 1000).toLocaleDateString()} at 09:00 AM
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <span className="text-cyan-400 mr-2">�</span>
            {event.venue || 'San Francisco, CA'}
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <span className="text-cyan-400 mr-2">�</span>
            {event.maxTickets.toLocaleString()} expected attendees
          </div>
        </div>
        
        {/* Ticket Sales Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Tickets sold</span>
            <span className="text-sm font-bold text-cyan-400">
              {ticketsSold.toLocaleString()}/{event.maxTickets.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300 progress-bar-fill"
              style={{ '--progress-width': `${Math.min(soldPercentage, 100)}%` } as React.CSSProperties}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{Math.round(soldPercentage)}% sold</span>
            <span>{Math.round(100 - soldPercentage)}% left</span>
          </div>
        </div>
        
        {/* Organizer */}
        <div className="mb-4 pb-4 border-b border-slate-700">
          <span className="text-xs text-gray-500">Organized by</span>
          <div className="text-sm text-white font-medium">BlockchainEvents LLC</div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            href={`/events/${event.id}`}
            className="flex-1 bg-cyan-500 text-slate-900 text-center py-3 rounded-lg hover:bg-cyan-400 transition-colors font-bold flex items-center justify-center gap-2"
          >
            🎫 Get NFT Ticket
          </Link>
          <button className="p-3 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors">
            <span className="text-gray-400">↗</span>
          </button>
        </div>
      </div>
    </div>
  );
}
