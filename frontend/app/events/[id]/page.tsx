"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useCombinedEvent } from "../../hooks/useCombinedEvent";
import { usePurchaseTicketDirect } from "../../hooks/useTransactionsDirect";
import { useClaimPOAP } from "../../hooks/useTransactions";
import { formatEther } from "viem";
import { toast } from "sonner";
import Link from "next/link";

// Prevent static rendering
export const dynamic = 'force-dynamic';
import { useQuery } from "@tanstack/react-query";
import { CONTRACT_ADDRESSES } from "../../../lib/contracts";
import { EnhancedConnectButton } from "../../components/EnhancedConnectButton";
import Image from "next/image";
import { readContract } from "../../../lib/contract-wrapper";
import { useMiniKit } from '@coinbase/onchainkit/minikit';

const EventDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const eventId = parseInt(params.id as string);
  const { isConnected, address } = useAccount();
  const { data: event, isLoading } = useCombinedEvent(eventId);
  const purchaseTicketMutation = usePurchaseTicketDirect(); // ✅ Using direct wallet hook
  const claimPOAPMutation = useClaimPOAP();
  const [quantity, setQuantity] = useState(1);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const { setFrameReady, isFrameReady } = useMiniKit();
  // Add Frame metadata for Farcaster Frames
  useEffect(() => {
    if (event) {
      // Add Frame metadata to document head
      const metaTags = [
        { property: 'fc:frame', content: 'vNext' },
        { property: 'fc:frame:image', content: event.imageUrl || 'https://echain.com/default-event-image.png' },
        { property: 'fc:frame:button:1', content: 'View Event' },
        { property: 'fc:frame:button:1:action', content: 'link' },
        { property: 'fc:frame:button:1:target', content: `https://echain.com/events/${eventId}` },
        { property: 'fc:frame:button:2', content: 'RSVP' },
        { property: 'fc:frame:post_url', content: `https://echain.com/api/frames/rsvp/${eventId}` },
      ];

      metaTags.forEach(({ property, content }) => {
        const meta = document.createElement('meta');
        meta.setAttribute('property', property);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      });

      return () => {
        // Cleanup meta tags on unmount
        metaTags.forEach(({ property }) => {
          const meta = document.querySelector(`meta[property="${property}"]`);
          if (meta) document.head.removeChild(meta);
        });
      };
    }
  }, [event, eventId]);

  // Initialize MiniKit Frame
  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [isFrameReady, setFrameReady]);

  // Check if user has tickets for this event
  const { data: hasTicket = false } = useQuery({
    queryKey: ['user-has-ticket', eventId, address, event?.ticketContract],
    queryFn: async (): Promise<boolean> => {
      if (!address || !event?.ticketContract) return false;

      try {
        const response = await fetch(`/api/contracts/user-tickets?address=${address}&contract=${event.ticketContract}`);
        if (!response.ok) {
          throw new Error('Failed to check user tickets');
        }
        const data = await response.json();
        return data.hasTicket || false;
      } catch (error) {
        console.error('Error checking user tickets:', error);
        return false;
      }
    },
    enabled: !!address && !!event?.ticketContract,
  });

  // Get sold tickets count using wrapper with fallback
  // For mock events, use attendees count; for blockchain events, fetch from contract
  const { data: soldTickets = 0 } = useQuery({
    queryKey: ['sold-tickets-blockchain', eventId, event?.ticketContract],
    queryFn: async (): Promise<number> => {
      // For mock events, return the attendees count
      if (isMockEvent(eventId)) {
        return (event as any)?.attendees || 0;
      }
      
      if (!event?.ticketContract) return 0;

      try {
        // Use direct contract interaction
        const totalSold = await readContract(
          'EventTicket',
          'totalSold',
          []
        );
        return Number(totalSold);
      } catch (error) {
        console.error('Error fetching sold tickets from blockchain:', error);
        return 0;
      }
    },
    enabled: !!event?.ticketContract,
    // Update every 30 seconds for real-time data
    refetchInterval: 30000,
    staleTime: 10000, // Consider data fresh for 10 seconds
  });

  // Check if user has claimed POAP for this event
  const { data: hasClaimedPOAP = false } = useQuery({
    queryKey: ['user-has-claimed-poap', eventId, address],
    queryFn: async (): Promise<boolean> => {
      if (!address) return false;

      try {
        const response = await fetch(`/api/poap/check-claim?eventId=${eventId}&address=${address}`);
        if (!response.ok) {
          throw new Error('Failed to check POAP claim');
        }
        const data = await response.json();
        return data.hasClaimed || false;
      } catch (error) {
        console.error('Error checking POAP claim:', error);
        return false;
      }
    },
    enabled: !!address,
    retry: (failureCount, error) => {
      // Don't retry contract call errors
      if (error?.message?.includes('execution reverted') || error?.message?.includes('call revert')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  });

  // Set progress bar width after component mounts
  useEffect(() => {
    if (progressBarRef.current && event) {
      const progressPercent = Math.min((soldTickets / event.maxTickets) * 100, 100);
      progressBarRef.current.style.width = `${progressPercent}%`;
    }
  }, [soldTickets, event]);

  const handlePurchaseTicket = async () => {
    if (!event || !isConnected) return;

    // Validate purchase
    const availableTickets = event.maxTickets - soldTickets;
    if (quantity > availableTickets) {
      toast.error(`Only ${availableTickets} tickets available`);
      return;
    }

    if (quantity < 1 || quantity > 10) {
      toast.error('Quantity must be between 1 and 10');
      return;
    }

    try {
      toast.loading("Preparing transaction...");

      // ✅ Using direct wallet hook - only needs eventId, contract, price, and quantity
      await purchaseTicketMutation.mutateAsync({
        eventId: event.id,
        ticketContract: event.ticketContract,
        ticketPrice: event.ticketPrice,
        quantity
      });

      toast.dismiss();
      toast.success(`Successfully purchased ${quantity} ticket${quantity > 1 ? 's' : ''}! 🎫`);
      
      // Redirect to my-tickets page to show the purchased NFT
      router.push('/my-tickets');
      
      // hasTicket will be updated automatically by the query
    } catch (error: any) {
      toast.dismiss();
      console.error('Purchase error:', error);
      toast.error(error.message || "Failed to purchase ticket. Please try again.");
    }
  };

  const handleClaimPOAP = async () => {
    if (!event || !isConnected) return;

    try {
      toast.loading("Claiming your POAP...");

      // Use the POAP contract from the event, or fallback to the default
      const poapContract = event.poapContract || CONTRACT_ADDRESSES.POAPAttendance;

      await claimPOAPMutation.mutateAsync({
        eventId: eventId,
        poapContract: poapContract
      });

      toast.dismiss();
      toast.success("POAP claimed successfully! 🏆");

      // Invalidate queries to refresh the UI
      // hasClaimedPOAP will be updated automatically by the query

    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Failed to claim POAP. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Event Not Found</h2>
          <Link
            href="/events"
            className="bg-primary text-primary-foreground px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const isEventEnded = event.endTime * 1000 < Date.now();
  const ticketPriceInEth = formatEther(event.ticketPrice);
  
  // We already have soldTickets from the query above, no need to recalculate
  // const soldTickets = Math.floor((event.id * 37) % (event.maxTickets * 0.8));

  const eventDetails = (event as any)?.details;
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Header */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/events" className="inline-flex items-center text-slate-400 hover:text-white transition-colors">
            <span className="mr-2">←</span>
            <span>Events</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Main Content (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Event Header Card */}
            <ModernCard variant="glass" className="p-0 overflow-hidden">
              {/* Event Image */}
              <div className="h-64 sm:h-80 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 relative overflow-hidden">
                {(event.image || event.imageUrl) ? (
                  <Image
                    src={event.image || event.imageUrl || ''}
                    alt={event.name}
                    fill
                    className="object-cover"
                    unoptimized={true}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-8xl opacity-50">🎪</div>
                  </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              {/* Event Info */}
              <div className="p-6">
                <h1 className="text-3xl font-bold text-white mb-4">{event.name}</h1>

                {/* Event Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4" />
                    <span>{formatDate(event.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4" />
                    <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMapPin className="w-4 h-4" />
                    <span>{event.venue || 'Online Event'}</span>
                  </div>
                </div>

                {/* Host Info */}
                <div className="mb-4">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Hosted By</span>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {eventDetails?.hosts ? (
                      eventDetails.hosts.map((host: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm">
                            {host.avatar || host.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm text-white font-medium">{host.name}</div>
                            {host.role && <div className="text-xs text-slate-500">{host.role}</div>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500" />
                        <span className="text-sm text-white">{event.organizer.slice(0, 6)}...{event.organizer.slice(-4)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {(event as any).tags && (
                  <div className="flex flex-wrap gap-2">
                    {(event as any).tags.map((tag: string) => (
                      <span key={tag} className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </ModernCard>

            {/* About Event */}
            {(event.description || eventDetails?.about) && (
              <ModernCard variant="glass" className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">About Event</h2>
                <p className="text-slate-400 leading-relaxed">
                  {eventDetails?.about || event.description}
                </p>
              </ModernCard>
            )}

            {/* What's Happening */}
            {eventDetails?.whatsHappening && (
              <ModernCard variant="glass" className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">What's Happening</h2>
                <ul className="space-y-2">
                  {eventDetails.whatsHappening.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-slate-400">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </ModernCard>
            )}

            {/* Prizes */}
            {eventDetails?.prizes && (
              <ModernCard variant="glass" className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Prizes</h2>
                <ul className="space-y-2">
                  {eventDetails.prizes.map((prize: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-slate-400">
                      <span className="text-yellow-400 mt-1">🏆</span>
                      <span>{prize}</span>
                    </li>
                  ))}
                </ul>
              </ModernCard>
            )}

            {/* What You'll Get */}
            {eventDetails?.whatYouGet && (
              <ModernCard variant="glass" className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">What You'll Get</h2>
                <ul className="space-y-2">
                  {eventDetails.whatYouGet.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-slate-400">
                      <HiCheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </ModernCard>
            )}

            {/* Who Should Join */}
            {eventDetails?.whoShouldJoin && (
              <ModernCard variant="glass" className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Who Should Join</h2>
                <ul className="space-y-2">
                  {eventDetails.whoShouldJoin.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-slate-400">
                      <FiUsers className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </ModernCard>
            )}

            {/* Registration */}
            {eventDetails?.registration && (
              <ModernCard variant="glass" className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Registration</h2>
                <p className="text-slate-400">{eventDetails.registration}</p>
              </ModernCard>
            )}

            {/* Event Location Map */}
            {event.venue && (
              <ModernCard variant="glass" className="p-6">
                <EventLocationMap venue={event.venue} />
              </ModernCard>
            )}
          </div>

          {/* Right Column - Ticket & Actions (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sticky Ticket Card */}
            <div className="lg:sticky lg:top-4">
              <ModernCard variant="glass" className="p-6">
                {/* You're In Badge */}
                {hasTicket && (
                  <div className="mb-4 inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                    <HiCheckCircle className="w-4 h-4" />
                    <span>You're In</span>
                  </div>
                )}

                {/* Live Badge */}
                {(event as any).isLive && (
                  <div className="mb-4 inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                    <span>LIVE</span>
                  </div>
                )}

                <h3 className="text-2xl font-bold text-white mb-2">{event.name}</h3>
                
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <FiCalendar className="w-4 h-4" />
                    <span>
                      {new Date(event.startTime * 1000).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <FiClock className="w-4 h-4" />
                    <span>{formatTime(event.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <FiMapPin className="w-4 h-4" />
                    <span>{event.venue || 'Online Event'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <HiTicket className="w-4 h-4" />
                    <span>{soldTickets} / {event.maxTickets} attending</span>
                  </div>
                </div>

                {/* Ticket Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Tickets Sold</span>
                    <span className="text-white font-medium">{soldTickets} / {event.maxTickets}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      ref={progressBarRef}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(soldTickets / event.maxTickets) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="border-t border-slate-700 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Ticket Price</span>
                    <span className="text-2xl font-bold text-white">
                      {parseFloat(ticketPriceInEth) === 0 ? 'Free' : `${ticketPriceInEth} ETH`}
                    </span>
                  </div>
                </div>

                {/* Purchase Section */}
                {!isEventEnded && (
                  <div className="space-y-4">
                    {isConnected ? (
                      soldTickets >= event.maxTickets ? (
                        <button
                          disabled
                          className="w-full bg-slate-700 text-slate-400 py-3 rounded-lg font-semibold cursor-not-allowed"
                        >
                          Sold Out
                        </button>
                      ) : isMockEvent(eventId) ? (
                        <>
                          <ModernButton
                            variant="gradient"
                            size="lg"
                            fullWidth
                            icon={<HiTicket />}
                            onClick={() => toast.info('This is a mock event. Purchase real NFT tickets on blockchain events!')}
                            className="font-semibold"
                          >
                            Get NFT Ticket
                          </ModernButton>
                          <p className="text-xs text-slate-500 text-center">
                            Mock event - No real tickets available
                          </p>
                        </>
                      ) : (
                        <>
                          {/* Quantity Selector */}
                          <div>
                            <label className="block text-sm text-slate-400 mb-2">Quantity</label>
                            <input
                              type="number"
                              min="1"
                              max={Math.min(10, event.maxTickets - soldTickets)}
                              value={quantity}
                              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                              className="w-full bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none"
                            />
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Total:</span>
                            <span className="text-xl font-bold text-cyan-400">
                              {(Number(ticketPriceInEth) * quantity).toFixed(4)} ETH
                            </span>
                          </div>

                          <ModernButton
                            variant="gradient"
                            size="lg"
                            fullWidth
                            icon={<HiTicket />}
                            onClick={handlePurchaseTicket}
                            loading={purchaseTicketMutation.isPending}
                            disabled={purchaseTicketMutation.isPending || quantity > (event.maxTickets - soldTickets)}
                            className="font-semibold"
                          >
                            {purchaseTicketMutation.isPending ? 'Processing...' : `Get ${quantity} NFT Ticket${quantity > 1 ? 's' : ''}`}
                          </ModernButton>
                        </>
                      )
                    ) : (
                      <div className="text-center">
                        <p className="text-slate-400 mb-4">Connect wallet to purchase tickets</p>
                        <EnhancedConnectButton />
                      </div>
                    )}
                  </div>
                )}

                {isEventEnded && (
                  <div className="bg-slate-800 rounded-lg p-4">
                    <p className="text-slate-400 text-center">This event has ended</p>
                  </div>
                )}

                {/* Social Links */}
                {eventDetails?.socialLinks && (
                  <div className="border-t border-slate-700 pt-4 mt-6">
                    <div className="flex gap-3">
                      {eventDetails.socialLinks.website && (
                        <a
                          href={eventDetails.socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                        >
                          <FiGlobe className="w-4 h-4" />
                          <span className="text-sm">Website</span>
                        </a>
                      )}
                      {eventDetails.socialLinks.twitter && (
                        <a
                          href={eventDetails.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                        >
                          <FiTwitter className="w-4 h-4" />
                          <span className="text-sm">Twitter</span>
                        </a>
                      )}
                      {eventDetails.socialLinks.discord && (
                        <a
                          href={eventDetails.socialLinks.discord}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                        >
                          <FiMessageCircle className="w-4 h-4" />
                          <span className="text-sm">Discord</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Share Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Event link copied!');
                    }}
                    className="flex-1 bg-slate-800 text-slate-400 py-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiShare2 className="w-4 h-4" />
                    <span className="text-sm">Share</span>
                  </button>
                  <button
                    onClick={() => toast.info('Bookmark feature coming soon!')}
                    className="flex-1 bg-slate-800 text-slate-400 py-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiBookmark className="w-4 h-4" />
                    <span className="text-sm">Save</span>
                  </button>
                </div>
              </ModernCard>
            </div>
          </div>
        </div>
      </div> 
                

      {/* POAP Section - Only show if event has ended and user has ticket */}
      {isEventEnded && hasTicket && (
        <section className="py-12 sm:py-16 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-xl sm:rounded-2xl border border-border p-6 sm:p-8">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="text-4xl sm:text-5xl lg:text-6xl mb-4">🏆</div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Claim Your POAP</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
                    Congratulations on attending this event! Claim your Proof of Attendance Protocol certificate -
                    a permanent record of your participation on the blockchain.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
                  {/* POAP Preview */}
                  <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                    <div className="text-center">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30">
                        <span className="text-4xl sm:text-5xl lg:text-6xl">🏆</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">{event.name}</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm mb-4">
                        Proof of Attendance - {event.formattedStartDate || new Date(event.startTime * 1000).toLocaleDateString()}
                      </p>
                      <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                        <span>⭐</span>
                        <span>Event Attendee</span>
                      </div>
                    </div>
                  </div>

                  {/* Claim Actions */}
                  <div className="space-y-4">
                    <div className="bg-card border border-border rounded-xl p-4">
                      <h4 className="text-base sm:text-lg font-semibold text-foreground mb-2">What is a POAP?</h4>
                      <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                        POAPs are soulbound NFTs that prove you attended this event. They become part of your
                        permanent on-chain history and can unlock special perks, rewards, and community access.
                      </p>
                    </div>

                    {hasClaimedPOAP ? (
                      <div className="bg-success-green/10 border border-success-green/20 rounded-xl p-4 sm:p-6 text-center">
                        <div className="text-3xl sm:text-4xl mb-4">✅</div>
                        <h3 className="text-lg sm:text-xl font-bold text-success-green mb-2">POAP Claimed!</h3>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                          Your attendance certificate has been added to your collection.
                        </p>
                        <Link
                          href="/poaps"
                          className="inline-block mt-4 bg-success-green text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-success-green/90 transition-colors font-semibold text-sm sm:text-base"
                        >
                          View My POAPs
                        </Link>
                      </div>
                    ) : (
                      <button
                        onClick={handleClaimPOAP}
                        disabled={claimPOAPMutation.isPending}
                        className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground py-3 sm:py-4 rounded-lg hover:from-primary/90 hover:to-secondary/90 transition-all duration-200 font-bold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {claimPOAPMutation.isPending ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-primary-foreground"></div>
                            Claiming POAP...
                          </span>
                        ) : (
                          "🏆 Claim My POAP"
                        )}
                      </button>
                    )}

                    <p className="text-muted-foreground text-xs text-center">
                      Free to claim • Gas fees apply • One per attendee
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Event Description */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">About This Event</h2>
            <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-6 sm:p-8">
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                {event.description || "Join us for an exciting blockchain event featuring the latest in NFT technology, decentralized ticketing, and Web3 innovation. This event will showcase the future of event management on the blockchain."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Blockchain Verification */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Blockchain Verification</h2>
            <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-6 sm:p-8">
              <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                This event is permanently recorded on the Base blockchain. Click the links below to verify all transactions and smart contract interactions on BaseScan.
              </p>

              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-foreground font-semibold mb-1">Event Creation</h3>
                      <p className="text-muted-foreground text-sm">Smart contract deployment and event registration</p>
                    </div>
                    <a
                      href={`https://sepolia.basescan.org/address/${CONTRACT_ADDRESSES.EventFactory}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      View on BaseScan ↗
                    </a>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-foreground font-semibold mb-1">NFT Ticket Contract</h3>
                      <p className="text-muted-foreground text-sm">ERC-721 contract for event tickets</p>
                    </div>
                    <a
                      href={`https://sepolia.basescan.org/address/${event.ticketContract}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      View on BaseScan ↗
                    </a>
                  </div>
                </div>

                {event.poapContract && (
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-foreground font-semibold mb-1">POAP Contract</h3>
                        <p className="text-muted-foreground text-sm">Proof of Attendance Protocol certificates</p>
                      </div>
                      <a
                        href={`https://sepolia.basescan.org/address/${event.poapContract}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                      >
                        View on BaseScan ↗
                      </a>
                    </div>
                  </div>
                )}

                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-foreground font-semibold mb-1">Event Metadata</h3>
                      <p className="text-muted-foreground text-sm">IPFS-stored event details and poster</p>
                    </div>
                    <a
                      href={event.metadataURI}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors text-sm font-medium"
                    >
                      View on IPFS ↗
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-primary text-xl mt-0.5">🔒</div>
                  <div>
                    <h4 className="text-primary font-semibold mb-1">Immutable & Verifiable</h4>
                    <p className="text-muted-foreground text-sm">
                      All event data, ticket sales, and attendance records are permanently stored on the blockchain.
                      Anyone can verify the authenticity of this event and its tickets at any time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventDetailPage;