"use client";

import React from "react";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { readContract } from "../../lib/contract-wrapper";
import { CONTRACT_ADDRESSES } from "../../lib/contracts";
import Link from "next/link";
import { RewardsDashboard } from "@/components/rewards/RewardsDashboard";

// Prevent static rendering
export const dynamic = 'force-dynamic';

interface POAP {
  id: string;
  eventId: number;
  eventName: string;
  claimDate: number;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  imageUrl?: string;
  description: string;
}

// Hook to fetch user's POAPs
const useUserPOAPs = () => {
  const { address } = useAccount();

  return useQuery({
    queryKey: ['user-poaps', address],
    queryFn: async (): Promise<POAP[]> => {
      if (!address) return [];

      try {
        // Get user's POAP balance (with automatic fallback)
        const balance = await readContract(
          'POAPAttendance',
          'balanceOf',
          [address]
        );

        console.log('POAP balance for user:', balance);

        const poaps: POAP[] = [];

        // Get each POAP token
        for (let i = 0; i < Number(balance); i++) {
          try {
            // Get token ID by index (with automatic fallback)
            const tokenId = await readContract(
              'POAPAttendance',
              'tokenOfOwnerByIndex',
              [address, i]
            );

            // Get attendance data (with automatic fallback)
            const attendanceData = await readContract(
              'POAPAttendance',
              'getAttendance',
              [tokenId]
            );

            // Get event data (with automatic fallback)
            const eventData = await readContract(
              'EventFactory',
              'getEvent',
              [attendanceData.eventId]
            );

            // Determine rarity based on some logic (could be based on event popularity, etc.)
            const rarity = getRarityForEvent(Number(attendanceData.eventId));

            poaps.push({
              id: tokenId.toString(),
              eventId: Number(attendanceData.eventId),
              eventName: eventData.name || `Event ${attendanceData.eventId}`,
              claimDate: Number(attendanceData.timestamp),
              rarity: rarity,
              description: `Attended ${eventData.name || `Event ${attendanceData.eventId}`}. This POAP represents your participation and becomes part of your permanent on-chain record.`
            });
          } catch (error) {
            console.error(`Error fetching POAP ${i}:`, error);
          }
        }

        return poaps;
      } catch (error) {
        console.error('Error fetching user POAPs:', error);
        // Return empty array instead of throwing error to prevent the "K" error
        return [];
      }
    },
    enabled: !!address,
    // Add retry and error handling
    retry: (failureCount, error) => {
      // Don't retry if it's a contract call error (likely no POAPs minted)
      if (error?.message?.includes('execution reverted') || error?.message?.includes('call revert')) {
        return false;
      }
      // Retry up to 2 times for network errors
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

// Helper function to determine POAP rarity (can be customized)
const getRarityForEvent = (eventId: number): POAP["rarity"] => {
  // Simple rarity logic - can be enhanced based on event data
  const rarityMap: Record<number, POAP["rarity"]> = {
    1: "Epic",
    2: "Rare",
    3: "Legendary"
  };
  return rarityMap[eventId] || "Common";
};

const POAPsPage: React.FC = () => {
  const { isConnected } = useAccount();
  const { data: poaps = [], isLoading } = useUserPOAPs();

  const getRarityColor = (rarity: POAP["rarity"]) => {
    switch (rarity) {
      case "Common": return "text-gray-400 border-gray-600";
      case "Rare": return "text-blue-400 border-blue-600";
      case "Epic": return "text-purple-400 border-purple-600";
      case "Legendary": return "text-yellow-400 border-yellow-600";
      default: return "text-gray-400 border-gray-600";
    }
  };

  const getRarityBg = (rarity: POAP["rarity"]) => {
    switch (rarity) {
      case "Common": return "bg-gray-500/20";
      case "Rare": return "bg-blue-500/20";
      case "Epic": return "bg-purple-500/20";
      case "Legendary": return "bg-yellow-500/20";
      default: return "bg-gray-500/20";
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🏆</div>
          <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8">Connect your wallet to view your POAP collection</p>
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
                <span className="text-purple-400">🏆</span>
                <span className="text-sm font-medium">POAP Collection</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">My POAPs</h1>
              <p className="text-gray-400 max-w-2xl">
                Your Proof of Attendance Protocol certificates. Each POAP represents a unique event experience and becomes part of your permanent on-chain record.
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-cyan-400 mb-1">{poaps.length}</div>
              <div className="text-gray-400 text-sm">Total POAPs</div>
            </div>
          </div>
        </div>
      </section>

      {/* POAPs Grid */}
      <section className="py-8 bg-slate-900">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading your POAP collection...</p>
            </div>
          ) : poaps.length > 0 ? (
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {poaps.map((poap) => (
                  <div key={poap.id} className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:scale-[1.02]">
                    {/* POAP Visual */}
                    <div className="h-48 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20"></div>
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRarityColor(poap.rarity)} ${getRarityBg(poap.rarity)}`}>
                          {poap.rarity}
                        </span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl">🏆</div>
                      </div>
                    </div>

                    {/* POAP Details */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2">{poap.eventName}</h3>
                      <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                        {poap.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Claimed:</span>
                          <span className="text-white">
                            {new Date(poap.claimDate * 1000).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Event ID:</span>
                          <span className="text-cyan-400">#{poap.eventId}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link
                          href={`/events/${poap.eventId}`}
                          className="flex-1 bg-slate-700 text-white text-center py-2 rounded-lg hover:bg-slate-600 transition-colors text-sm"
                        >
                          View Event
                        </Link>
                        <button className="bg-cyan-500 text-black px-4 py-2 rounded-lg hover:bg-cyan-400 transition-colors text-sm">
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
              <div className="text-6xl mb-6">🏆</div>
              <h2 className="text-2xl font-bold text-white mb-4">No POAPs Yet</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                You haven't collected any Proof of Attendance certificates yet. Attend events and claim your POAPs to build your on-chain event history!
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

      {/* Rewards Dashboard */}
      <section className="py-16 bg-slate-800/30">
        <div className="container mx-auto px-4">
          <RewardsDashboard />
        </div>
      </section>

      {/* Collection Stats */}
      {poaps.length > 0 && (
        <section className="py-16 bg-slate-800/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-8 text-center">Collection Stats</h2>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-1">{poaps.length}</div>
                  <div className="text-gray-400 text-sm">Total POAPs</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">
                    {poaps.filter(p => p.rarity === "Legendary").length}
                  </div>
                  <div className="text-gray-400 text-sm">Legendary</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-1">
                    {poaps.filter(p => p.rarity === "Epic").length}
                  </div>
                  <div className="text-gray-400 text-sm">Epic</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-1">
                    {poaps.filter(p => p.rarity === "Rare").length}
                  </div>
                  <div className="text-gray-400 text-sm">Rare</div>
                </div>
              </div>

              {/* Achievement Message */}
              <div className="mt-8 text-center">
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-2">🏆 Event Enthusiast</h3>
                  <p className="text-gray-400">
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    You've attended {poaps.length} events and collected {poaps.length} unique POAPs.
                    Your on-chain event history is growing!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default POAPsPage;
