"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useMarketplaceListings, useBuyMarketplaceTicket } from "../hooks/useMarketplace";
import { useWalletHelpers } from "../hooks/useWalletHelpers";
import { toast } from "@/components/ui/use-toast";

// Buy button component
const BuyButton: React.FC<{ listing: any }> = ({ listing }) => {
  const { address } = useAccount();
  const { connectWallet, formatEth, ensureBaseSepoliaNetwork } = useWalletHelpers();
  const buyMutation = useBuyMarketplaceTicket();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleBuyClick = async () => {
    try {
      if (!address) {
        connectWallet();
        return;
      }
      
      // Prevent buying your own listing
      if (address.toLowerCase() === listing.seller.toLowerCase()) {
        toast({
          title: "Cannot buy your own listing",
          description: "You cannot purchase a ticket that you've listed yourself.",
          variant: "destructive"
        });
        return;
      }
      
      setIsProcessing(true);
      
      // Ensure user is on Base Sepolia
      const networkOk = await ensureBaseSepoliaNetwork();
      if (!networkOk) {
        toast({
          title: "Network Error",
          description: "Please switch to Base Sepolia network to continue with your purchase.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      // Confirm the purchase
      if (!confirm(`Purchase this ticket for ${formatEth(listing.price)} ETH?`)) {
        setIsProcessing(false);
        return;
      }
      
      await buyMutation.mutateAsync({
        listingId: listing.id,
        price: listing.price.toString(),
      });
      
      toast({
        title: "Purchase Successful!",
        description: "Ticket purchased successfully! Check your wallet for the NFT.",
        variant: "default"
      });
    } catch (error: any) {
      console.error("Error buying ticket:", error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase ticket. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const isLoading = buyMutation.isPending || isProcessing;
  const isOwner = address && address.toLowerCase() === listing.seller.toLowerCase();
  
  let buttonLabel = "💳 Buy Now";
  if (!address) buttonLabel = "Connect Wallet";
  if (isLoading) buttonLabel = "Processing...";
  if (isOwner) buttonLabel = "Your Listing";
  
  return (
    <button 
      className={`flex-1 text-center py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${
        isOwner 
          ? "bg-slate-700 text-white cursor-not-allowed" 
          : "bg-cyan-500 text-slate-900 hover:bg-cyan-400 transition-colors"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      onClick={handleBuyClick}
      disabled={isLoading || isOwner}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {buttonLabel}
    </button>
  );
};

const MarketplacePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("price-low");
  const { data: marketplaceItems, isLoading, error } = useMarketplaceListings();
  
  // Filter listings based on search term
  const filteredListings = marketplaceItems?.filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      item.eventName.toLowerCase().includes(searchLower) ||
      item.ticketType.toLowerCase().includes(searchLower) ||
      item.seller.toLowerCase().includes(searchLower) ||
      item.location.toLowerCase().includes(searchLower)
    );
  });
  
  // Sort listings
  const sortedListings = [...(filteredListings || [])].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return Number(a.price - b.price);
      case 'price-high':
        return Number(b.price - a.price);
      case 'date':
        return a.eventDate - b.eventDate;
      case 'recent':
        return b.listedAt - a.listedAt;
      default:
        return 0;
    }
  });

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
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
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
                    className="bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none w-full md:w-auto"
                    aria-label="Sort marketplace items"
                  >
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="date">Event Date</option>
                    <option value="recent">Recently Listed</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4 md:mt-0">
                <Link
                  href="/marketplace/my-listings"
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-700 transition-colors"
                >
                  My Listings
                </Link>
                <Link
                  href="/marketplace/create"
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 font-semibold"
                >
                  List Ticket
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Items */}
      <section className="py-8 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">⏳</div>
                <h2 className="text-2xl font-bold text-white mb-4">Loading Marketplace</h2>
                <p className="text-gray-400">Fetching available tickets...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">⚙️</div>
                <h2 className="text-2xl font-bold text-white mb-4">Database Not Configured</h2>
                <p className="text-gray-400 mb-4">
                  The marketplace requires database configuration to display real listings.
                </p>
                <p className="text-sm text-gray-500 mb-8">
                  Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables to enable marketplace functionality.
                </p>
                <Link
                  href="/events"
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 font-semibold"
                >
                  Browse Events Instead
                </Link>
              </div>
            ) : sortedListings && sortedListings.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedListings.map((item) => (
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
                          {(Number(item.price) / 1e18).toFixed(3)} ETH
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
                          {new Date(item.eventDate * 1000).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <span className="text-cyan-400 mr-2">📍</span>
                          {item.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <span className="text-cyan-400 mr-2">👤</span>
                          Seller: {item.seller.slice(0, 6)}...{item.seller.slice(-4)}
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Current Price</span>
                          <span className="text-lg font-bold text-cyan-400">{(Number(item.price) / 1e18).toFixed(3)} ETH</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Original Price</span>
                          <span className="text-sm text-gray-400 line-through">{(Number(item.originalPrice) / 1e18).toFixed(3)} ETH</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <BuyButton listing={item} />
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
                <p className="text-gray-400 mb-8">
                  {searchTerm ? `No tickets matching "${searchTerm}" were found.` : "Check back later for tickets on the secondary market."}
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
        </div>
      </section>

      {/* Sell Your Tickets Section */}
      <section className="py-16 bg-slate-800/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Have Tickets to Sell?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            List your event tickets on our secure marketplace and reach thousands of potential buyers.
          </p>
          <Link href="/marketplace/create" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg hover:from-purple-400 hover:to-pink-400 transition-all duration-200 font-semibold">
            List Your Tickets
          </Link>
        </div>
      </section>
    </div>
  );
};

export default MarketplacePage;
