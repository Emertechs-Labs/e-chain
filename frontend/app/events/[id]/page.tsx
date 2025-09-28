"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useEvent } from "../../hooks/useEvents";
import { usePurchaseTicket } from "../../hooks/useTransactions";
import { useClaimPOAP } from "../../hooks/useTransactions";
import { formatEther } from "viem";
import { toast } from "sonner";
import Link from "next/link";

const EventDetailPage: React.FC = () => {
  const params = useParams();
  const eventId = parseInt(params.id as string);
  const { isConnected } = useAccount();
  const { data: event, isLoading } = useEvent(eventId);
  const purchaseTicketMutation = usePurchaseTicket();
  const claimPOAPMutation = useClaimPOAP();
  const [quantity, setQuantity] = useState(1);
  const [hasTicket, setHasTicket] = useState(false); // This would be checked from blockchain
  const [hasClaimedPOAP, setHasClaimedPOAP] = useState(false); // This would be checked from blockchain

  const handlePurchaseTicket = async () => {
    if (!event || !isConnected) return;

    try {
      toast.loading("Purchasing ticket...");

      await purchaseTicketMutation.mutateAsync({
        eventId: event.id,
        ticketContract: event.ticketContract,
        ticketPrice: event.ticketPrice,
        quantity
      });

      toast.dismiss();
      toast.success(`Successfully purchased ${quantity} ticket${quantity > 1 ? 's' : ''}!`);
      setHasTicket(true); // Mark as having ticket after purchase
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Failed to purchase ticket. Please try again.");
    }
  };

  const handleClaimPOAP = async () => {
    if (!event || !isConnected) return;

    try {
      toast.loading("Claiming your POAP...");

      await claimPOAPMutation.mutateAsync({
        eventId: event.id,
        poapContract: event.poapContract || "0x0000000000000000000000000000000000000000" // fallback
      });

      toast.dismiss();
      toast.success("POAP claimed successfully! 🏆");
      setHasClaimedPOAP(true);
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Failed to claim POAP. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Event Not Found</h2>
          <Link
            href="/events"
            className="bg-cyan-500 text-black px-6 py-2 rounded-lg hover:bg-cyan-400 transition-colors"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const isEventEnded = event.endTime * 1000 < Date.now();
  const ticketPriceInEth = formatEther(event.ticketPrice);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Event Image */}
            <div className="h-96 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
              <div className="text-8xl">🎪</div>
            </div>

            {/* Event Details */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-green-500/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                  ✓ Verified Event
                </span>
                <span className="bg-slate-800/80 text-cyan-400 px-3 py-1 rounded-full text-sm">
                  {event.category || 'Conference'}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-white mb-4">{event.name}</h1>

              <div className="space-y-4 mb-8">
                <div className="flex items-center text-gray-300">
                  <span className="text-cyan-400 mr-3">📅</span>
                  {new Date(event.startTime * 1000).toLocaleDateString()} - {new Date(event.endTime * 1000).toLocaleDateString()}
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-cyan-400 mr-3">📍</span>
                  {event.venue || 'Location TBA'}
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-cyan-400 mr-3">🎫</span>
                  {event.maxTickets.toLocaleString()} tickets available
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-cyan-400 mr-3">💰</span>
                  {ticketPriceInEth} ETH per ticket
                </div>
              </div>

              {/* Purchase Section */}
              {!isEventEnded && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Get Your NFT Ticket</h3>

                  {isConnected ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                          placeholder="1"
                          className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-between items-center text-white">
                        <span>Total:</span>
                        <span className="text-xl font-bold text-cyan-400">
                          {(parseFloat(ticketPriceInEth) * quantity).toFixed(3)} ETH
                        </span>
                      </div>

                      <button
                        onClick={handlePurchaseTicket}
                        disabled={purchaseTicketMutation.isPending}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {purchaseTicketMutation.isPending ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Purchasing...
                          </span>
                        ) : (
                          `🎫 Purchase ${quantity} Ticket${quantity > 1 ? 's' : ''}`
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-400 mb-4">Connect your wallet to purchase tickets</p>
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg cursor-pointer">
                        Connect Wallet
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isEventEnded && (
                <div className="bg-red-900/50 backdrop-blur-sm rounded-2xl border border-red-700 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">Event Ended</h3>
                  <p className="text-gray-400">This event has already taken place.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* POAP Section - Only show if event has ended and user has ticket */}
      {isEventEnded && hasTicket && (
        <section className="py-16 bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-blue-500/10 rounded-2xl border border-purple-500/20 p-8">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">🏆</div>
                  <h2 className="text-3xl font-bold text-white mb-4">Claim Your POAP</h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    Congratulations on attending this event! Claim your Proof of Attendance Protocol certificate -
                    a permanent record of your participation on the blockchain.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* POAP Preview */}
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-purple-500/20 via-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                        <span className="text-6xl">🏆</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Proof of Attendance - {new Date(event.startTime * 1000).toLocaleDateString()}
                      </p>
                      <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                        <span>⭐</span>
                        <span>Event Attendee</span>
                      </div>
                    </div>
                  </div>

                  {/* Claim Actions */}
                  <div className="space-y-4">
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                      <h4 className="text-lg font-semibold text-white mb-2">What is a POAP?</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        POAPs are soulbound NFTs that prove you attended this event. They become part of your
                        permanent on-chain history and can unlock special perks, rewards, and community access.
                      </p>
                    </div>

                    {hasClaimedPOAP ? (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
                        <div className="text-4xl mb-4">✅</div>
                        <h3 className="text-xl font-bold text-green-400 mb-2">POAP Claimed!</h3>
                        <p className="text-gray-400 text-sm">
                          Your attendance certificate has been added to your collection.
                        </p>
                        <Link
                          href="/poaps"
                          className="inline-block mt-4 bg-green-500 text-black px-6 py-2 rounded-lg hover:bg-green-400 transition-colors font-semibold"
                        >
                          View My POAPs
                        </Link>
                      </div>
                    ) : (
                      <button
                        onClick={handleClaimPOAP}
                        disabled={claimPOAPMutation.isPending}
                        className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white py-4 rounded-lg hover:from-purple-400 hover:to-cyan-400 transition-all duration-200 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {claimPOAPMutation.isPending ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Claiming POAP...
                          </span>
                        ) : (
                          "🏆 Claim My POAP"
                        )}
                      </button>
                    )}

                    <p className="text-gray-400 text-xs text-center">
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
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">About This Event</h2>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
              <p className="text-gray-300 leading-relaxed">
                {event.description || 'Join us for an amazing blockchain event featuring industry leaders, innovative technologies, and networking opportunities. This event brings together developers, entrepreneurs, and enthusiasts from the Web3 ecosystem.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventDetailPage;