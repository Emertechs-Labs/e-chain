"use client";

import React from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEventsByOrganizer } from "../hooks/useEvents";
import EventCard from "../components/events/EventCard";
import { Event } from "../../types/event";

const MyEventsPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { data: events = [], isLoading: loading } = useEventsByOrganizer(address);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-md">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            You need to connect your wallet to view your events
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
            <p className="text-gray-600 mt-2">Events you have created and organized</p>
          </div>
          <Link
            href="/events/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Event
          </Link>
        </div>

        {/* Events Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{events.length}</div>
            <div className="text-gray-600">Total Events</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {events.filter((event: Event) => event.isActive).length}
            </div>
            <div className="text-gray-600">Active Events</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-gray-600">Total Tickets Sold</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-purple-600">0 ETH</div>
            <div className="text-gray-600">Total Revenue</div>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your events...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event: Event) => (
              <div key={event.id} className="relative">
                <EventCard event={event} />
                <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-sm">
                  <button className="text-gray-600 hover:text-gray-800">
                    <span className="text-sm">⚙️</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <span className="text-6xl">📋</span>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No events created yet</h3>
            <p className="text-gray-600 mb-6">
              Start by creating your first blockchain-powered event
            </p>
            <Link
              href="/events/create"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEventsPage;
