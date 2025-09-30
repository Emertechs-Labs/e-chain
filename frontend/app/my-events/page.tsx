"use client";

import React from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { EnhancedConnectButton } from "../components/EnhancedConnectButton";
import { useEventsByOrganizer } from "../hooks/useEvents";

const MyEventsPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { data: events = [], isLoading } = useEventsByOrganizer();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🔗</div>
          <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Connect your wallet to view and manage your events.
          </p>
          <EnhancedConnectButton />
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
                  <div key={event.id} className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 hover:border-cyan-500/50 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>
                        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-400">
                          <div>
                            <span className="text-cyan-400">📅</span> Event ID: {event.id}
                          </div>
                          <div>
                            <span className="text-cyan-400">💰</span> Price: {event.ticketPrice ? `${Number(event.ticketPrice) / 1e18} ETH` : 'N/A'}
                          </div>
                          <div>
                            <span className="text-cyan-400">🎫</span> Max Tickets: {event.maxTickets}
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            event.isActive
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {event.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Link
                          href={`/events/${event.id}`}
                          className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors"
                        >
                          View Event
                        </Link>
                        <Link
                          href={`/events/${event.id}/manage`}
                          className="bg-cyan-500 text-black px-4 py-2 rounded-lg hover:bg-cyan-400 transition-colors"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  </div>
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
