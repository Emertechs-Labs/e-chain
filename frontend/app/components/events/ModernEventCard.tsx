'use client';

import React, { useEffect, useRef } from 'react';
import { Event } from '../../../types/event';
import { formatEther } from 'viem';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getOrganizerDisplayName, formatEventDate, generateDefaultMetadata } from '../../../lib/metadata';
import { useEventTicketsSold } from '../../hooks/useTickets';
import { ModernCard } from '../ui/ModernCard';
import { ModernButton } from '../ui/ModernButton';
import { FiCalendar, FiMapPin, FiUsers, FiCheckCircle, FiExternalLink, FiClock } from 'react-icons/fi';
import { HiTicket, HiSparkles } from 'react-icons/hi';

interface ModernEventCardProps {
  event: Event;
  index?: number;
}

export default function ModernEventCard({ event, index = 0 }: ModernEventCardProps) {
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
    const width = `${Math.min(Math.round(soldPercentage || 0), 100)}%`;
    requestAnimationFrame(() => {
      el.style.width = width;
    });
  }, [soldPercentage]);

  const categoryColors: Record<string, string> = {
    Workshop: 'from-blue-500 to-cyan-500',
    Networking: 'from-purple-500 to-pink-500',
    Conference: 'from-green-500 to-teal-500',
    Hackathon: 'from-orange-500 to-red-500',
    Meetup: 'from-indigo-500 to-blue-500',
    General: 'from-cyan-500 to-blue-500',
  };

  const gradientClass = categoryColors[displayCategory || 'General'] || categoryColors.General;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <ModernCard
        variant="glass"
        padding="none"
        hover
        className="h-full flex flex-col overflow-hidden border-slate-700/50 bg-slate-800/40"
      >
        {/* Event Image/Banner */}
        <div className="h-48 relative overflow-hidden">
          {/* Gradient Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-90`} />
          
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full">
              <pattern
                id={`pattern-${event.id}`}
                x="0"
                y="0"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="20" cy="20" r="1.5" fill="white" opacity="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill={`url(#pattern-${event.id})`} />
            </svg>
          </div>

          {/* Event Image if available */}
          {(event.image || event.imageUrl) && (
            <Image 
              src={event.image || event.imageUrl || ''} 
              alt={event.name}
              fill
              className="object-cover mix-blend-overlay opacity-30"
              unoptimized={true}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
              <FiCheckCircle className="w-3 h-3" />
              Verified
            </span>
            <span className="bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
              {displayCategory}
            </span>
            <span className="bg-purple-500/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
              Limited NFT
            </span>
          </div>

          {/* Price Badge */}
          <div className="absolute top-4 right-4">
            <div className="bg-cyan-500/90 backdrop-blur-sm text-slate-900 px-4 py-2 rounded-lg">
              <div className="text-xs font-medium opacity-80">Ticket Price</div>
              <div className="text-lg font-bold">{ticketPriceInEth} ETH</div>
            </div>
          </div>

          {/* Event Icon */}
          {!(event.image || event.imageUrl) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="text-7xl drop-shadow-2xl"
              >
                🎪
              </motion.div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
            {event.name}
          </h3>

          {/* Description */}
          <p className="text-slate-400 text-sm mb-4 line-clamp-2">
            {displayDescription}
          </p>

          {/* Event Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <FiCalendar className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300">
                {event.formattedStartDate || formatEventDate(event.startTime)}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <FiMapPin className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300">{displayVenue}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <FiUsers className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300">
                {event.maxTickets.toLocaleString()} expected attendees
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <FiClock className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300">
                {Math.ceil((event.endTime - event.startTime) / 3600)} hour event
              </span>
            </div>
          </div>

          {/* Ticket Sales Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400">Tickets sold</span>
              <span className="text-xs font-bold text-cyan-400">
                {ticketsSold.toLocaleString()}/{event.maxTickets.toLocaleString()}
              </span>
            </div>
            <div className="relative w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${soldPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              />
              {/* Shimmer effect */}
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="h-full w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>{Math.round(soldPercentage)}% sold</span>
              <span>{Math.round(100 - soldPercentage)}% remaining</span>
            </div>
          </div>

          {/* Organizer */}
          <div className="pb-4 border-b border-slate-700/50 mb-4">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Organized by</span>
            <div className="text-sm text-white font-medium mt-1 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500" />
              {organizerName}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-auto">
            <Link href={`/events/${event.id}`} className="flex-1">
              <ModernButton 
                variant="gradient" 
                size="sm" 
                fullWidth
                icon={<HiTicket />}
                iconPosition="left"
                className="font-semibold"
              >
                Get NFT Ticket
              </ModernButton>
            </Link>
            <a
              href={`https://sepolia.basescan.org/address/${event.ticketContract}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-slate-600 rounded-lg hover:bg-slate-700/50 transition-all hover:border-cyan-500/50 group"
              title="View on BaseScan"
            >
              <FiExternalLink className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </a>
          </div>
        </div>
      </ModernCard>
    </motion.div>
  );
}
