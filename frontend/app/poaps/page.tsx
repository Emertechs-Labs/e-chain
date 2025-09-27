"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Event, POAPClaim } from "../../types/event";

// Mock data for POAP claims - will be replaced with actual contract calls
const mockPOAPs: (POAPClaim & { event: Event })[] = [
  {
    eventId: 1,
    attendee: "0x1234567890123456789012345678901234567890",
    claimedAt: Math.floor(Date.now() / 1000) - 86400,
    tokenId: 1001,
    signature: "0xabc123...",
    event: {
      id: 1,
      name: "Tech Conference 2024",
      symbol: "TECH24",
      organizer: "0x1234567890123456789012345678901234567890",
      ticketContract: "0x1111111111111111111111111111111111111111",
      maxTickets: 500,
      ticketPrice: BigInt("10000000000000000"),
      saleEndTime: Math.floor(Date.now() / 1000) + 86400 * 30,
      isActive: true,
      description: "Annual technology conference featuring the latest innovations",
      venue: "Convention Center",
      category: "Technology"
    }
  }
];

const POAPsPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'owned' | 'available'>('owned');
  
  const ownedPOAPs = mockPOAPs.filter(poap => 
    poap.attendee.toLowerCase() === address?.toLowerCase()
  );

  // Mock available POAPs (events the user attended but hasn't claimed POAP yet)
  const availablePOAPs: Event[] = [];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-md">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            You need to connect your wallet to view your POAPs
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My POAPs</h1>
          <p className="text-gray-600 mt-2">Proof of Attendance Protocol tokens from events you've attended</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{ownedPOAPs.length}</div>
            <div className="text-gray-600">POAPs Collected</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{availablePOAPs.length}</div>
            <div className="text-gray-600">Available to Claim</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {new Set(ownedPOAPs.map(p => p.event.category)).size}
            </div>
            <div className="text-gray-600">Categories</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('owned')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'owned'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My POAPs ({ownedPOAPs.length})
              </button>
              <button
                onClick={() => setActiveTab('available')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'available'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Available to Claim ({availablePOAPs.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'owned' ? (
              ownedPOAPs.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ownedPOAPs.map((poap) => (
                    <div key={poap.tokenId} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                      <div className="text-center mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <span className="text-2xl text-white">🏆</span>
                        </div>
                        <h3 className="font-semibold text-gray-900">{poap.event.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{poap.event.category}</p>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Token ID:</span>
                          <span className="font-medium">#{poap.tokenId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Claimed:</span>
                          <span className="font-medium">
                            {new Date(poap.claimedAt * 1000).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Venue:</span>
                          <span className="font-medium">{poap.event.venue || 'Digital'}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                          View on OpenSea
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <span className="text-6xl">🏆</span>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No POAPs collected yet</h3>
                  <p className="text-gray-600 mb-6">
                    Attend events and claim your proof of attendance tokens
                  </p>
                  <a
                    href="/events"
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Find Events
                  </a>
                </div>
              )
            ) : (
              availablePOAPs.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availablePOAPs.map((event) => (
                    <div key={event.id} className="bg-green-50 rounded-lg p-6 border border-green-200">
                      <div className="text-center mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-400 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <span className="text-2xl text-white">🎁</span>
                        </div>
                        <h3 className="font-semibold text-gray-900">{event.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{event.category}</p>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 text-center">
                        You attended this event and can claim your POAP!
                      </p>

                      <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                        Claim POAP
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <span className="text-6xl">🎁</span>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No POAPs available to claim</h3>
                  <p className="text-gray-600 mb-6">
                    Attend events to unlock claimable POAPs
                  </p>
                  <a
                    href="/events"
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Browse Events
                  </a>
                </div>
              )
            )}
          </div>
        </div>

        {/* POAP Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About POAPs</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">What are POAPs?</h3>
              <p className="text-gray-600 text-sm">
                Proof of Attendance Protocol (POAP) tokens are digital collectibles that prove you attended an event. 
                Each POAP is unique and becomes part of your digital identity.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">How to earn POAPs?</h3>
              <p className="text-gray-600 text-sm">
                Purchase tickets to events, attend them, and claim your POAP afterward. 
                Some events may have additional requirements or interactive elements to unlock POAPs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POAPsPage;
