"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useEvent } from "../../hooks/useEvents";
import { usePurchaseTicketDirect } from "../../hooks/useTransactionsDirect"; // Direct wallet (no MultiBaas)
import { useClaimPOAP } from "../../hooks/useTransactions";
import { formatEther } from "viem";
import { toast } from "sonner";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CONTRACT_ADDRESSES } from "../../../lib/contracts";
import { EnhancedConnectButton } from "../../components/EnhancedConnectButton";
import Image from "next/image";
import { readContract } from "../../../lib/contract-wrapper";
import { baseSepolia } from 'viem/chains';
import { CONTRACT_ABIS } from "../../../lib/contracts";

const EventDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const eventId = parseInt(params.id as string);
  const { isConnected, address } = useAccount();
  const { data: event, isLoading } = useEvent(eventId);
  const purchaseTicketMutation = usePurchaseTicketDirect(); // ✅ Using direct wallet hook
  const claimPOAPMutation = useClaimPOAP();
  const [quantity, setQuantity] = useState(1);
  const progressBarRef = useRef<HTMLDivElement>(null);

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
  const { data: soldTickets = 0 } = useQuery({
    queryKey: ['sold-tickets-blockchain', eventId, event?.ticketContract],
    queryFn: async (): Promise<number> => {
      if (!event?.ticketContract) return 0;

      try {
        // Use wrapper with MultiBaas fallback to direct RPC
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted to-background"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Event Image */}
            <div className="h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-2xl flex items-center justify-center order-2 lg:order-1 relative overflow-hidden">
              {(event.image || event.imageUrl) && (
                <Image
                  src={event.image || event.imageUrl || ''}
                  alt={event.name}
                  fill
                  className="object-cover rounded-2xl"
                  unoptimized={true}
                  onError={(e) => {
                    // Hide broken images and fall back to emoji
                    console.warn('Failed to load event image:', event.image || event.imageUrl);
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              {/* Fallback emoji - always visible if no image or image fails to load */}
              <div className="absolute inset-0 flex items-center justify-center text-4xl sm:text-6xl lg:text-8xl z-10 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-2xl">
                🎪
              </div>
            </div>

            {/* Event Details */}
            <div className="order-1 lg:order-2">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-green-500/90 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  ✓ Verified Event
                </span>
                <span className="bg-muted text-muted-foreground px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  {event.category || 'Conference'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">{event.name}</h1>

              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <div className="flex items-center text-muted-foreground">
                  <span className="text-primary mr-3">📅</span>
                  <span className="text-sm sm:text-base">
                    {event.formattedStartDate && event.formattedEndDate 
                      ? `${event.formattedStartDate} - ${event.formattedEndDate}`
                      : `${new Date(event.startTime * 1000).toLocaleDateString()} - ${new Date(event.endTime * 1000).toLocaleDateString()}`
                    }
                  </span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <span className="text-primary mr-3">📍</span>
                  <span className="text-sm sm:text-base">{event.venue || 'Location TBA'}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <span className="text-primary mr-3">🎫</span>
                  <span className="text-sm sm:text-base">
                    {event.maxTickets - soldTickets} of {event.maxTickets.toLocaleString()} tickets available
                  </span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <span className="text-primary mr-3">💰</span>
                  <span className="text-sm sm:text-base">{ticketPriceInEth} ETH per ticket</span>
                </div>
              </div>

              {/* Purchase Section */}
              {!isEventEnded && (
                <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4">Get Your NFT Ticket</h3>

                  {/* Availability Status */}
                  <div className="mb-4 p-3 rounded-lg border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground text-sm sm:text-base">Availability:</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm sm:text-base ${
                          soldTickets >= event.maxTickets 
                            ? 'text-destructive' 
                            : event.maxTickets - soldTickets < 10 
                            ? 'text-warning-orange' 
                            : 'text-success-green'
                        }`}>
                          {soldTickets >= event.maxTickets 
                            ? 'SOLD OUT' 
                            : `${event.maxTickets - soldTickets} Available`
                          }
                        </span>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live data from blockchain"></div>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        ref={progressBarRef}
                        className={`h-2 rounded-full transition-all duration-500 ${
                          soldTickets >= event.maxTickets 
                            ? 'bg-destructive' 
                            : soldTickets / event.maxTickets > 0.8 
                            ? 'bg-warning-orange' 
                            : 'bg-success-green'
                        }`}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                      <span>{soldTickets} sold</span>
                      <span>{event.maxTickets} total</span>
                    </div>
                  </div>

                  {hasTicket && (
                    <div className="mb-4 p-3 bg-success-green/10 border border-success-green/20 rounded-lg">
                      <p className="text-success-green text-sm">✅ You already own a ticket for this event!</p>
                    </div>
                  )}

                  {isConnected ? (
                    soldTickets >= event.maxTickets ? (
                      <div className="text-center">
                        <div className="mb-4 p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                          <h4 className="text-destructive font-semibold mb-2 text-sm sm:text-base">🎫 SOLD OUT</h4>
                          <p className="text-muted-foreground text-xs sm:text-sm">All tickets for this event have been sold.</p>
                        </div>
                        <button
                          disabled
                          className="w-full bg-muted text-muted-foreground py-3 sm:py-4 rounded-lg font-bold text-sm sm:text-base cursor-not-allowed"
                        >
                          Sold Out
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={Math.min(10, event.maxTickets - soldTickets)}
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            placeholder="1"
                            className="w-full bg-muted text-foreground px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-border focus:border-primary focus:outline-none text-sm sm:text-base"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Max {Math.min(10, event.maxTickets - soldTickets)} tickets per transaction
                          </p>
                        </div>

                        <div className="flex justify-between items-center text-foreground">
                          <span className="text-sm sm:text-base">Total:</span>
                          <span className="text-lg sm:text-xl font-bold text-primary">
                            {(Number(ticketPriceInEth) * quantity).toFixed(3)} ETH
                          </span>
                        </div>

                        <button
                          onClick={handlePurchaseTicket}
                          disabled={purchaseTicketMutation.isPending || quantity > (event.maxTickets - soldTickets)}
                          className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-3 sm:py-4 rounded-lg hover:from-primary/90 hover:to-primary/70 transition-all duration-200 font-bold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {purchaseTicketMutation.isPending ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-primary-foreground"></div>
                              Processing...
                            </span>
                          ) : (
                            `🎫 Purchase ${quantity} Ticket${quantity > 1 ? 's' : ''}`
                          )}
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="text-center">
                      <p className="text-muted-foreground mb-4 text-sm sm:text-base">Connect your wallet to purchase tickets</p>
                      <EnhancedConnectButton />
                    </div>
                  )}
                </div>
              )}

              {isEventEnded && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">Event Ended</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">This event has already taken place.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

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