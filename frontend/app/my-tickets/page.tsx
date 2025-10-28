"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useUserTickets } from "../hooks/useTickets";
import Link from "next/link";
import { RewardsDashboard } from "@/components/rewards/RewardsDashboard";
import { getVerificationUrl } from "../../lib/ipfs";

// Prevent static rendering
export const dynamic = 'force-dynamic';

const MyTicketsPage: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { data: tickets = [], isLoading, error } = useUserTickets();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});

  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('[MyTicketsPage] Component state:', {
      isConnected,
      address,
      ticketsCount: tickets.length,
      isLoading,
      error
    });
  }

  // Enhanced debug: Check events API
  useEffect(() => {
    const loadDebugInfo = async () => {
      if (typeof window !== 'undefined' && address) {
        // Check events API
        try {
          const eventsResponse = await fetch('/api/events');
          const events = eventsResponse.ok ? await eventsResponse.json() : [];
          if (process.env.NODE_ENV === 'development') {
            console.log('[MyTicketsPage] Events from API:', events);
          }

          setDebugInfo({
            eventsFromAPI: events,
            eventsCount: events.length
          });
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[MyTicketsPage] Error loading debug info:', err);
          }
        }
      }
    };

    loadDebugInfo();
  }, [address]);

  const handleVerifyTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setShowQRModal(true);
  };

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🎫</div>
          <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8">Connect your wallet to view your NFT tickets</p>
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg cursor-pointer">
            Connect Wallet
          </div>
          <div className="text-sm text-gray-400 mt-4">
            <p>Connection Status: {isConnected ? 'Connected' : 'Not Connected'}</p>
            <p>Address: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'None'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-6 text-cyan-400">
                <span className="text-purple-400">🎫</span>
                <span className="text-sm font-medium">My Tickets</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">My NFT Tickets</h1>
              <p className="text-gray-400 max-w-2xl">
                View and manage all your blockchain-verified event tickets. Each ticket is a unique NFT on the Base network.
              </p>
            </div>
            <Link
              href="/events"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 font-semibold"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </section>

      {/* Tickets List */}
      <section className="py-8 bg-slate-900">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading your tickets...</p>
            </div>
          ) : tickets.length > 0 ? (
            <div className="max-w-6xl mx-auto">
              <div className="grid gap-6">
                {tickets.map((ticket) => (
                  <div key={ticket.tokenId} className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 hover:border-cyan-500/50 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        {/* Ticket Visual */}
                        <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-slate-600">
                          <span className="text-3xl">🎫</span>
                        </div>

                        {/* Ticket Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-white">{ticket.eventName}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              ticket.isUsed
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-green-500/20 text-green-400'
                            }`}>
                              {ticket.isUsed ? 'Used' : 'Valid'}
                            </span>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-400">
                            <div>
                              <span className="text-cyan-400">🏷️</span> {ticket.ticketType}
                            </div>
                            <div>
                              <span className="text-cyan-400">�</span> {ticket.venue}
                            </div>
                            <div>
                              <span className="text-cyan-400">📅</span> {new Date(ticket.eventDate * 1000).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Link
                          href={`/events/${ticket.eventId}`}
                          className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors"
                        >
                          View Event
                        </Link>
                        <button
                          onClick={() => handleVerifyTicket(ticket)}
                          className="bg-cyan-500 text-black px-4 py-2 rounded-lg hover:bg-cyan-400 transition-colors"
                        >
                          Verify
                        </button>
                        {!ticket.isUsed && (
                          <button className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors">
                            Transfer
                          </button>
                        )}
                        <button className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors">
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🎫</div>
              <h2 className="text-2xl font-bold text-white mb-4">No Tickets Yet</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                You haven't purchased any event tickets yet. Browse upcoming events and get your first NFT ticket!
              </p>
              <div className="text-sm text-gray-500 mb-6">
                <p>Debug Info:</p>
                <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
                <p>Address: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'None'}</p>
                <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
                <p>Error: {error ? error.message : 'None'}</p>
                <p>Tickets Found: {tickets.length}</p>
                <p>Events in DB: {debugInfo.eventsCount || 0}</p>
                <p>Stored Transactions: Removed (using direct contract reads)</p>
                <button
                  onClick={() => {
                    // Force refresh tickets
                    window.location.reload();
                  }}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded"
                >
                  Refresh
                </button>
              </div>
              <Link
                href="/events"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 font-semibold"
              >
                Browse Events
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Rewards Dashboard */}
      <section className="py-16 bg-slate-800/30">
        <div className="container mx-auto px-4">
          <RewardsDashboard />
        </div>
      </section>

      {/* Stats Section */}
      {tickets.length > 0 && (
        <section className="py-16 bg-slate-800/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-8 text-center">Your Ticket Stats</h2>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-1">{tickets.length}</div>
                  <div className="text-gray-400 text-sm">Total Tickets</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-1">
                    {tickets.filter(t => !t.isUsed).length}
                  </div>
                  <div className="text-gray-400 text-sm">Valid Tickets</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-1">
                    {tickets.length}
                  </div>
                  <div className="text-gray-400 text-sm">Total Tickets</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">
                    {tickets.filter(t => t.isUsed).length}
                  </div>
                  <div className="text-gray-400 text-sm">Used Tickets</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* QR Code Verification Modal */}
      {showQRModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Verify Ticket</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 p-4">
                {/* Placeholder for QR code - in production this would be generated */}
                <div className="text-center text-black">
                  <div className="text-6xl mb-2">📱</div>
                  <p className="text-sm">Scan to Verify</p>
                </div>
              </div>

              <h4 className="text-lg font-semibold text-white mb-2">{selectedTicket.eventName}</h4>
              <p className="text-gray-400 text-sm mb-4">
                Ticket #{selectedTicket.tokenId} • {selectedTicket.ticketType}
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href={getVerificationUrl('placeholder-tx-hash')} // In production, use actual transaction hash
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-cyan-500 text-black px-4 py-3 rounded-lg hover:bg-cyan-400 transition-colors font-semibold text-center block"
              >
                🔍 View on BaseScan
              </Link>

              <button
                onClick={() => setShowQRModal(false)}
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;
