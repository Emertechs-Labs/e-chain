"use client";

import React from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Event, Ticket } from "../../types/event";

// Mock data for tickets - will be replaced with actual contract calls
const mockTickets: (Ticket & { event: Event; purchasePrice: bigint })[] = [
  {
    eventId: 1,
    owner: "0x1234567890123456789012345678901234567890",
    tokenId: 101,
    purchasePrice: BigInt("10000000000000000"),
    mintedAt: Math.floor(Date.now() / 1000) - 86400,
    isUsed: false,
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

const MyTicketsPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const tickets = mockTickets.filter(ticket => 
    ticket.owner.toLowerCase() === address?.toLowerCase()
  );

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-md">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            You need to connect your wallet to view your tickets
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  const formatPrice = (price: bigint) => {
    return (Number(price) / 1e18).toFixed(4);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-gray-600 mt-2">NFT tickets you have purchased</p>
        </div>

        {/* Tickets Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{tickets.length}</div>
            <div className="text-gray-600">Total Tickets</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {tickets.filter(ticket => !ticket.isUsed).length}
            </div>
            <div className="text-gray-600">Unused Tickets</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {tickets.filter(ticket => ticket.isUsed).length}
            </div>
            <div className="text-gray-600">Used Tickets</div>
          </div>
        </div>

        {/* Tickets List */}
        {tickets.length > 0 ? (
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <div key={ticket.tokenId} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {ticket.event.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          ticket.isUsed 
                            ? 'bg-gray-100 text-gray-600' 
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {ticket.isUsed ? 'Used' : 'Valid'}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Token ID:</span>
                          <div className="font-medium">#{ticket.tokenId}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Price Paid:</span>
                          <div className="font-medium">{formatPrice(ticket.purchasePrice)} ETH</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Venue:</span>
                          <div className="font-medium">{ticket.event.venue || 'TBA'}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <div className="font-medium">{ticket.event.category}</div>
                        </div>
                      </div>

                      {ticket.event.description && (
                        <p className="text-gray-600 mt-3">{ticket.event.description}</p>
                      )}
                    </div>

                    <div className="ml-6 flex flex-col gap-2">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        View Details
                      </button>
                      {!ticket.isUsed && (
                        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                          Transfer
                        </button>
                      )}
                    </div>
                  </div>

                  {/* QR Code placeholder */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Contract: {ticket.event.ticketContract.slice(0, 6)}...{ticket.event.ticketContract.slice(-4)}
                      </div>
                      <div className="bg-gray-100 p-2 rounded">
                        <span className="text-xs text-gray-500">QR Code</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <span className="text-6xl">🎫</span>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No tickets yet</h3>
            <p className="text-gray-600 mb-6">
              Purchase tickets to events to see them here
            </p>
            <a
              href="/events"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Events
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTicketsPage;
