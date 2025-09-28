"use client";

import React, { useState } from "react";
import Link from "next/link";

interface MarketplaceItem {
  id: string;
  eventName: string;
  ticketType: string;
  price: string;
  originalPrice: string;
  seller: string;
  eventDate: string;
  location: string;
  verified: boolean;
}

const mockMarketplaceItems: MarketplaceItem[] = [
  {
    id: "1",
    eventName: "Web3 Developer Conference 2024",
    ticketType: "VIP Access",
    price: "0.15 ETH",
    originalPrice: "0.1 ETH",
    seller: "0x1234...5678",
    eventDate: "March 15, 2024",
    location: "San Francisco, CA",
    verified: true
  },
  {
    id: "2",
    eventName: "DeFi Summit: Future of Finance",
    ticketType: "General Admission",
    price: "0.12 ETH",
    originalPrice: "0.08 ETH",
    seller: "0xabcd...efgh",
    eventDate: "March 22, 2024",
    location: "New York, NY",
    verified: true
  },
  {
    id: "3",
    eventName: "NFT Art & Culture Festival",
    ticketType: "Artist Pass",
    price: "0.08 ETH",
    originalPrice: "0.05 ETH",
    seller: "0x9876...4321",
    eventDate: "April 5, 2024",
    location: "Los Angeles, CA",
    verified: false
  }
];

const MarketplacePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("price-low");

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 mb-6 text-cyan-400">
            <span className="text-purple-400">🛒</span>
            <span className="text-sm font-medium">Secondary Market</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Ticket Marketplace</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Buy and sell event tickets securely on the blockchain. All transactions are verified and transparent.
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search events, tickets, or sellers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="date">Event Date</option>
                  <option value="recent">Recently Listed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Items */}
      <section className="py-8 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {mockMarketplaceItems.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mockMarketplaceItems.map((item) => (
                  <div key={item.id} className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:scale-[1.02]">
                    {/* Ticket Image */}
                    <div className="h-48 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20"></div>
                      <div className="absolute top-4 left-4 flex gap-2">
                        {item.verified && (
                          <span className="bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            ✓ Verified
                          </span>
                        )}
                        <span className="bg-slate-800/80 text-orange-400 px-3 py-1 rounded-full text-xs font-medium">
                          Resale
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-cyan-500 text-slate-900 px-3 py-1 rounded-full text-sm font-bold">
                          {item.price}
                        </span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl">🎫</div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2">{item.eventName}</h3>
                      <p className="text-gray-400 text-sm mb-4">{item.ticketType}</p>
                      
                      {/* Event Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-400">
                          <span className="text-cyan-400 mr-2">📅</span>
                          {item.eventDate}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <span className="text-cyan-400 mr-2">📍</span>
                          {item.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <span className="text-cyan-400 mr-2">👤</span>
                          Seller: {item.seller}
                        </div>
                      </div>
                      
                      {/* Pricing */}
                      <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Current Price</span>
                          <span className="text-lg font-bold text-cyan-400">{item.price}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Original Price</span>
                          <span className="text-sm text-gray-400 line-through">{item.originalPrice}</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button className="flex-1 bg-cyan-500 text-slate-900 text-center py-3 rounded-lg hover:bg-cyan-400 transition-colors font-bold flex items-center justify-center gap-2">
                          💳 Buy Now
                        </button>
                        <button className="p-3 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors">
                          <span className="text-gray-400">💬</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">🛒</div>
                <h2 className="text-2xl font-bold text-white mb-4">No Tickets Available</h2>
                <p className="text-gray-400 mb-8">Check back later for tickets on the secondary market.</p>
                <Link
                  href="/events"
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 font-semibold"
                >
                  Browse Events
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sell Your Tickets Section */}
      <section className="py-16 bg-slate-800/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Have Tickets to Sell?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            List your event tickets on our secure marketplace and reach thousands of potential buyers.
          </p>
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg hover:from-purple-400 hover:to-pink-400 transition-all duration-200 font-semibold">
            List Your Tickets
          </button>
        </div>
      </section>
    </div>
  );
};

export default MarketplacePage;
