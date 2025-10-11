"use client";

import React from "react";
import Link from "next/link";
import { useWalletConnection } from '@echain/wallet';
import { formatEther } from "viem";
import { UnifiedConnectButton } from '@echain/wallet/components';
import { useEventsByOrganizer, useOrganizerMetrics } from "../hooks/useEvents";
import { readContract } from "../../lib/contract-wrapper";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Users, DollarSign, TrendingUp, Calendar, MapPin } from "lucide-react";

// Prevent static rendering
export const dynamic = 'force-dynamic';

// Hook to get event metrics
const useEventMetrics = (event: any) => {
  return useQuery({
    queryKey: ['event-metrics', event?.id, event?.ticketContract],
    queryFn: async () => {
      if (!event?.ticketContract) {
        return {
          soldTickets: 0,
          revenue: '0',
          attendanceRate: 0,
          poapClaims: 0,
          status: event?.isActive ? 'active' : 'inactive'
        };
      }

      try {
        // Get real sold tickets from blockchain
        const soldTickets = await readContract(
          'EventTicket',
          'totalSold',
          [],
          event.ticketContract
        );

        const soldTicketsNum = Number(soldTickets);
        const revenue = soldTicketsNum * Number(formatEther(event.ticketPrice));

        // Estimate POAP claims (in production, you'd query the POAP contract)
        const poapClaims = Math.floor(soldTicketsNum * 0.7); // Estimate 70% claim rate

        // Calculate attendance rate (simplified)
        const attendanceRate = soldTicketsNum > 0 ? (poapClaims / soldTicketsNum) * 100 : 0;

        return {
          soldTickets: soldTicketsNum,
          revenue: revenue.toFixed(3),
          attendanceRate: Math.round(attendanceRate),
          poapClaims,
          status: event.isActive ? 'active' : 'inactive'
        };
      } catch (error) {
        console.error('Error fetching event metrics:', error);
        return {
          soldTickets: 0,
          revenue: '0',
          attendanceRate: 0,
          poapClaims: 0,
          status: event?.isActive ? 'active' : 'inactive'
        };
      }
    },
    enabled: !!event?.ticketContract,
    refetchInterval: 60000, // Refresh every minute
  });
};

// Event Card Component
const EventCard: React.FC<{ event: any }> = ({ event }) => {
  const metricsQuery = useEventMetrics(event);
  const metrics = metricsQuery.data || { soldTickets: 0, revenue: '0', attendanceRate: 0, poapClaims: 0, status: 'active' };

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 hover:border-cyan-500/50 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xl font-bold text-white">{event.name}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              metrics.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {metrics.status}
            </span>
          </div>

          {/* Event Details */}
          <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{event.venue || 'Venue TBA'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(event.startTime * 1000).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-slate-700/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Sold</span>
              </div>
              <p className="text-white font-semibold">{metrics.soldTickets}/{event.maxTickets}</p>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Revenue</span>
              </div>
              <p className="text-white font-semibold">{metrics.revenue} ETH</p>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">Attendance</span>
              </div>
              <p className="text-white font-semibold">{metrics.attendanceRate}%</p>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-gray-400">POAPs</span>
              </div>
              <p className="text-white font-semibold">{metrics.poapClaims}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Sales Progress</span>
              <span>{Math.round((metrics.soldTickets / event.maxTickets) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className={`progress-fill ${
                metrics.soldTickets / event.maxTickets > 0.8 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                metrics.soldTickets / event.maxTickets > 0.5 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                'bg-gradient-to-r from-cyan-500 to-blue-500'
              }`}></div>
            </div>
            <style jsx>{`
              .progress-fill {
                width: ${Math.min((metrics.soldTickets / event.maxTickets) * 100, 100)}%;
                height: 0.5rem;
                border-radius: 9999px;
                transition: all 0.5s;
              }
            `}</style>
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <Link
            href={`/events/${event.id}`}
            className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors text-sm"
          >
            View Event
          </Link>
          <Link
            href={`/events/${event.id}/manage`}
            className="bg-cyan-500 text-black px-4 py-2 rounded-lg hover:bg-cyan-400 transition-colors text-sm"
          >
            Manage
          </Link>
        </div>
      </div>
    </div>
  );
};

const MyEventsPage: React.FC = () => {
  const { address, isConnected } = useWalletConnection();
  const { data: events = [], isLoading } = useEventsByOrganizer();
  const { data: metrics } = useOrganizerMetrics();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🔗</div>
          <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Connect your wallet to view and manage your events.
          </p>
          <div className="flex justify-center">
            <UnifiedConnectButton />
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
                <span className="text-purple-400">📅</span>
                <span className="text-sm font-medium">My Events</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Manage Your Events</h1>
              <p className="text-gray-400 max-w-2xl">
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                View, manage, and track all events you've created on the blockchain.
              </p>
            </div>
            <Link
              href="/events/create"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 font-semibold"
            >
              Create New Event
            </Link>
          </div>

          {/* Metrics Overview */}
          {events.length > 0 && metrics && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{metrics.totalEvents}</h3>
                <p className="text-gray-400 text-sm">Total Events</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {metrics.totalTicketsSold}
                </h3>
                <p className="text-gray-400 text-sm">Tickets Sold</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {metrics.totalRevenue}
                </h3>
                <p className="text-gray-400 text-sm">Total Revenue (ETH)</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {metrics.totalPOAPClaims}
                </h3>
                <p className="text-gray-400 text-sm">POAP Claims</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Events List */}
      <section className="py-8 bg-slate-900">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading your events...</p>
            </div>
          ) : events.length > 0 ? (
            <div className="max-w-6xl mx-auto">
              <div className="grid gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">📅</div>
              <h2 className="text-2xl font-bold text-white mb-4">No Events Yet</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                You haven't created any events yet. Start by creating your first blockchain event.
              </p>
              <Link
                href="/events/create"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 font-semibold"
              >
                Create Your First Event
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MyEventsPage;
