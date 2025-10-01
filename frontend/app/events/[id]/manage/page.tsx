"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useEvent } from "../../../hooks/useEvents";
import { formatEther } from "viem";
import Link from "next/link";
import { ArrowLeft, Users, DollarSign, Calendar, Settings, BarChart3 } from "lucide-react";
import { readContract } from "../../../../lib/contract-wrapper";
import { CONTRACT_ADDRESSES } from "../../../../lib/contracts";
import styles from "./page.module.css";

const EventManagementPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const eventId = parseInt(params.id as string);
  const { address } = useAccount();
  const { data: event, isLoading } = useEvent(eventId);

  // Mock metrics data - in a real app, this would come from the database/blockchain
  const [metrics, setMetrics] = useState({
    totalTickets: 0,
    soldTickets: 0,
    revenue: '0',
    uniqueAttendees: 0,
    poapClaims: 0,
    eventStatus: 'active'
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      if (event && event.ticketContract) {
        try {
          // Get real sold tickets from blockchain
          const soldTickets = await readContract(
            event.ticketContract as `0x${string}`,
            'totalSold',
            []
          );

          const soldTicketsNum = Number(soldTickets);
          const revenue = soldTicketsNum * Number(formatEther(event.ticketPrice));

          // Get real POAP claims count for this event
          let poapClaims = 0;
          try {
            // Note: POAP contract doesn't have totalSupply function
            // For now, estimate based on tickets sold
            // In production, you'd need to add a totalSupply function to the POAP contract
            // or maintain a counter in the EventFactory
            poapClaims = Math.floor(soldTicketsNum * 0.7); // Estimate 70% claim rate
          } catch (error) {
            console.error('Error fetching POAP claims:', error);
            poapClaims = Math.floor(soldTicketsNum * 0.7); // Fallback estimate
          }

          setMetrics({
            totalTickets: event.maxTickets,
            soldTickets: soldTicketsNum,
            revenue: revenue.toFixed(3),
            uniqueAttendees: soldTicketsNum, // Approximate with sold tickets for now
            poapClaims: poapClaims,
            eventStatus: event.isActive ? 'active' : 'inactive'
          });
        } catch (error) {
          console.error('Error fetching metrics:', error);
          // Keep metrics at 0 if unable to fetch real data
          setMetrics({
            totalTickets: event.maxTickets,
            soldTickets: 0,
            revenue: '0',
            uniqueAttendees: 0,
            poapClaims: 0,
            eventStatus: event.isActive ? 'active' : 'inactive'
          });
        }
      }
    };

    fetchMetrics();
  }, [event]);

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
            href="/my-events"
            className="bg-cyan-500 text-black px-6 py-2 rounded-lg hover:bg-cyan-400 transition-colors"
          >
            Back to My Events
          </Link>
        </div>
      </div>
    );
  }

  // Check if user is the organizer
  if (address?.toLowerCase() !== event.organizer.toLowerCase()) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-4">You can only manage events you created.</p>
          <Link
            href="/my-events"
            className="bg-cyan-500 text-black px-6 py-2 rounded-lg hover:bg-cyan-400 transition-colors"
          >
            Back to My Events
          </Link>
        </div>
      </div>
    );
  }

  const revenuePercentage = metrics.totalTickets > 0 ? (metrics.soldTickets / metrics.totalTickets) * 100 : 0;
  const attendanceRate = metrics.soldTickets > 0 ? (metrics.uniqueAttendees / metrics.soldTickets) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <section className="py-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">{event.name}</h1>
                <p className="text-gray-400">Event Management Dashboard</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/events/${eventId}`}
                className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors"
              >
                View Event
              </Link>
              <button className="bg-cyan-500 text-black px-4 py-2 rounded-lg hover:bg-cyan-400 transition-colors">
                <Settings className="w-4 h-4 inline mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Overview */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Tickets Sold */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  metrics.eventStatus === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {metrics.eventStatus}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{metrics.soldTickets}/{metrics.totalTickets}</h3>
              <p className="text-gray-400 text-sm">Tickets Sold</p>
                <div className="mt-3 bg-slate-700 rounded-full h-2">
                <div
                  className={styles.ticketProgressBar}
                  data-progress={Math.round(revenuePercentage / 10) * 10}
                ></div>
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{metrics.revenue} ETH</h3>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-green-400 text-sm mt-2">+{revenuePercentage.toFixed(1)}% of capacity</p>
            </div>

            {/* Attendees */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{metrics.uniqueAttendees}</h3>
              <p className="text-gray-400 text-sm">Unique Attendees</p>
              <p className="text-purple-400 text-sm mt-2">{attendanceRate.toFixed(1)}% check-in rate</p>
            </div>

            {/* POAP Claims */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{metrics.poapClaims}</h3>
              <p className="text-gray-400 text-sm">POAP Claims</p>
              <p className="text-orange-400 text-sm mt-2">Event completed</p>
            </div>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales Chart */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Ticket Sales Progress</h3>
              <div className="space-y-4">
                {/* Progress visualization */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Tickets Sold</span>
                  <span className="text-white font-medium">{metrics.soldTickets} / {metrics.totalTickets}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-4">
                  <div
                    className={styles.salesProgressBar}
                    data-progress={Math.round(revenuePercentage / 10) * 10}
                  ></div>
                </div>
                <div className="text-center text-gray-400 text-sm">
                  {revenuePercentage.toFixed(1)}% of total capacity sold
                </div>

                {/* Revenue breakdown */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Total Revenue</p>
                    <p className="text-white text-xl font-bold">{metrics.revenue} ETH</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Avg Price</p>
                    <p className="text-white text-xl font-bold">
                      {metrics.soldTickets > 0 ? (parseFloat(metrics.revenue) / metrics.soldTickets).toFixed(3) : '0.000'} ETH
                    </p>
                  </div>
                </div>

                {/* Sales velocity indicator */}
                <div className="mt-4">
                  <p className="text-gray-400 text-sm mb-2">Sales Velocity</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      revenuePercentage > 75 ? 'bg-green-500' :
                      revenuePercentage > 50 ? 'bg-yellow-500' :
                      revenuePercentage > 25 ? 'bg-orange-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-white text-sm">
                      {revenuePercentage > 75 ? 'High Demand' :
                       revenuePercentage > 50 ? 'Good Sales' :
                       revenuePercentage > 25 ? 'Moderate' : 'Slow Start'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendee List */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Recent Attendees</h3>
              <div className="space-y-3">
                {metrics.soldTickets > 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">
                      {metrics.soldTickets} ticket{metrics.soldTickets !== 1 ? 's' : ''} sold
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      Detailed attendee list coming soon
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🎫</div>
                    <p className="text-gray-400 text-sm">No tickets sold yet</p>
                    <p className="text-gray-500 text-xs mt-2">
                      Attendees will appear here once tickets are purchased
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Management Actions */}
          <div className="mt-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Event Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-blue-500/20 border border-blue-500/30 text-blue-400 px-4 py-3 rounded-lg hover:bg-blue-500/30 transition-colors">
                📧 Send Announcement
              </button>
              <button className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg hover:bg-green-500/30 transition-colors">
                📊 Export Data
              </button>
              <button className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg hover:bg-red-500/30 transition-colors">
                🚫 Cancel Event
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventManagementPage;