/**
 * Frame-optimized Event Page
 * Displays event details and purchase flow within Farcaster frame
 */

'use client';

import { useEffect, useState } from 'react';
import { useMiniApp } from '@/components/providers/MiniAppProvider';
import { TicketPurchase } from '@/components/frames/TicketPurchase';
import { useFarcasterAnalytics } from '@/hooks/useFarcasterFrame';
import { FramePerformanceMonitor } from '@/hooks/useFramePerformance';
import sdk from '@farcaster/miniapp-sdk';

interface FrameEventPageProps {
  eventId: string;
}

interface EventData {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  price: string;
  organizer: string;
  capacity: number;
  soldTickets: number;
  imageUrl?: string;
}

export default function FrameEventPage({ eventId }: FrameEventPageProps) {
  const { isInFrame, user, isReady } = useMiniApp();
  const { trackView, trackShare, trackEngage } = useFarcasterAnalytics();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) throw new Error('Event not found');

        const data = await response.json();
        setEvent(data);
        trackView(eventId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, trackView]);

  // Handle share action
  const handleShare = async () => {
    try {
      await sdk.actions.openUrl(`https://echain.app/events/${eventId}`);
      trackShare(eventId);
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // Loading state
  if (!isReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
        <div className="text-white text-lg">Loading event...</div>
      </div>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-500 p-6">
        <div className="bg-white rounded-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-600">{error || 'This event does not exist'}</p>
        </div>
      </div>
    );
  }

  // Calculate availability
  const availableTickets = event.capacity - event.soldTickets;
  const isSoldOut = availableTickets <= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Performance Monitoring */}
      <FramePerformanceMonitor eventId={eventId} />

      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {user && (
            <div className="flex items-center gap-3 text-white">
              {user.pfpUrl && (
                <img
                  src={user.pfpUrl}
                  alt={user.displayName || 'User'}
                  className="w-10 h-10 rounded-full border-2 border-white/30"
                />
              )}
              <div className="flex-1">
                <div className="font-medium">{user.displayName || user.username}</div>
                <div className="text-xs text-white/70">@{user.username}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Event Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Event Image */}
          {event.imageUrl && (
            <div className="aspect-video w-full overflow-hidden bg-gray-100">
              <img
                src={event.imageUrl}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Event Details */}
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.name}</h1>
              <p className="text-gray-600">{event.description}</p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">📅 Date</div>
                <div className="font-medium">{new Date(event.date).toLocaleDateString()}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">📍 Location</div>
                <div className="font-medium">{event.location}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">👤 Organizer</div>
                <div className="font-medium">{event.organizer}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">🎫 Available</div>
                <div className="font-medium">
                  {isSoldOut ? (
                    <span className="text-red-600">Sold Out</span>
                  ) : (
                    `${availableTickets} / ${event.capacity}`
                  )}
                </div>
              </div>
            </div>

            {/* Purchase Section */}
            {!isSoldOut && (
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Get Your Ticket</h2>
                <TicketPurchase
                  eventId={event.id}
                  eventName={event.name}
                  ticketPrice={event.price}
                  contractAddress={process.env.NEXT_PUBLIC_TICKET_CONTRACT_ADDRESS || ''}
                  onSuccess={(txHash) => {
                    console.log('Ticket purchased:', txHash);
                  }}
                  onError={(error) => {
                    console.error('Purchase failed:', error);
                  }}
                />
              </div>
            )}

            {/* Share Button */}
            {isInFrame && (
              <button
                onClick={handleShare}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>🔗</span>
                <span>Share Event</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
