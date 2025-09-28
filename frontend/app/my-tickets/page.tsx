"use client";

import React from "react";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { callContractRead } from "../../lib/multibaas";
import { CONTRACT_ADDRESSES } from "../../lib/contracts";
import { formatEther } from "viem";
import Link from "next/link";

interface UserTicket {
  eventId: number;
  ticketId: string;
  eventName: string;
  ticketType: string;
  purchaseDate: number;
  price: bigint;
  transferable: boolean;
  used: boolean;
}

// Hook to fetch user's tickets
const useUserTickets = () => {
  const { address } = useAccount();

  return useQuery({
    queryKey: ['user-tickets', address],
    queryFn: async (): Promise<UserTicket[]> => {
      if (!address) return [];

      try {
        // Get all events first
        const [eventIds] = await callContractRead(
          CONTRACT_ADDRESSES.EventFactory,
          'EventFactory',
          'getActiveEvents',
          [0, 100] // Get up to 100 events
        );

        const userTickets: UserTicket[] = [];

        // For each event, check if user owns tickets
        for (const eventId of eventIds) {
          try {
            const eventData = await callContractRead(
              CONTRACT_ADDRESSES.EventFactory,
              'EventFactory',
              'getEvent',
              [eventId]
            );

            if (eventData.ticketContract) {
              // Get user's tickets for this event
              const userTicketIds = await callContractRead(
                eventData.ticketContract,
                'EventTicket',
                'getOwnerTickets',
                [address]
              );

              // Get details for each ticket
              for (const ticketId of userTicketIds) {
                try {
                  const ticketInfo = await callContractRead(
                    eventData.ticketContract,
                    'EventTicket',
                    'getTicketInfo',
                    [ticketId]
                  );

                  userTickets.push({
                    eventId: Number(eventId),
                    ticketId: ticketId.toString(),
                    eventName: eventData.name || `Event ${eventId}`,
                    ticketType: `Tier ${ticketInfo.tier}`,
                    purchaseDate: Number(ticketInfo.mintedAt),
                    price: BigInt(eventData.ticketPrice),
                    transferable: true, // Assume transferable unless restricted
                    used: ticketInfo.isUsed
                  });
                } catch (error) {
                  console.error(`Error fetching ticket ${ticketId} info:`, error);
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching event ${eventId}:`, error);
          }
        }

        return userTickets;
      } catch (error) {
        console.error('Error fetching user tickets:', error);
        return [];
      }
    },
    enabled: !!address,
  });
};

const MyTicketsPage: React.FC = () => {
  const { isConnected } = useAccount();
  const { data: tickets = [], isLoading } = useUserTickets();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🎫</div>
          <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8">Connect your wallet to view your NFT tickets</p>
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg cursor-pointer">
            Connect Wallet
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
                  <div key={ticket.ticketId} className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 hover:border-cyan-500/50 transition-all duration-300">
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
                              ticket.used
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-green-500/20 text-green-400'
                            }`}>
                              {ticket.used ? 'Used' : 'Valid'}
                            </span>
                            {ticket.transferable && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                                Transferable
                              </span>
                            )}
                          </div>

                          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-400">
                            <div>
                              <span className="text-cyan-400">🏷️</span> {ticket.ticketType}
                            </div>
                            <div>
                              <span className="text-cyan-400">💰</span> {formatEther(ticket.price)} ETH
                            </div>
                            <div>
                              <span className="text-cyan-400">📅</span> {new Date(ticket.purchaseDate * 1000).toLocaleDateString()}
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
                        {!ticket.used && ticket.transferable && (
                          <button className="bg-cyan-500 text-black px-4 py-2 rounded-lg hover:bg-cyan-400 transition-colors">
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
                You haven't purchased any event tickets yet. Browse upcoming events and get your first NFT ticket!
              </p>
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
                    {tickets.filter(t => !t.used).length}
                  </div>
                  <div className="text-gray-400 text-sm">Valid Tickets</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-1">
                    {tickets.filter(t => t.transferable).length}
                  </div>
                  <div className="text-gray-400 text-sm">Transferable</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">
                    {tickets.reduce((sum, t) => sum + Number(formatEther(t.price)), 0).toFixed(2)}
                  </div>
                  <div className="text-gray-400 text-sm">Total Value (ETH)</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default MyTicketsPage;
