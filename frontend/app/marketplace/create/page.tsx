"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import Link from "next/link";
import { parseEther } from "viem";
import { useListTicketForSale } from "../../hooks/useMarketplace";
import { useUserTickets, UserTicket } from "../../hooks/useTickets";
import { useWalletHelpers } from "@polymathuniversata/echain-wallet/hooks";
import { CONTRACT_ADDRESSES } from "../../../lib/contracts";

// Prevent static rendering
export const dynamic = 'force-dynamic';
import { toast } from "sonner";

const CreateListingPage: React.FC = () => {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connectWallet, ensureBaseSepoliaNetwork, formatAddress } = useWalletHelpers();
  const { data: userTickets, isLoading } = useUserTickets();
  const { mutateAsync: listTicket, isPending: isListingPending } = useListTicketForSale();
  
  const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null);
  const [price, setPrice] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [networkChecked, setNetworkChecked] = useState<boolean>(false);
  
  // Filter out used tickets
  const availableTickets = userTickets?.filter(ticket => !ticket.isUsed) || [];
  
  // Check network on mount
  useEffect(() => {
    if (isConnected) {
      ensureBaseSepoliaNetwork()
        .then(result => setNetworkChecked(result));
    }
  }, [isConnected, ensureBaseSepoliaNetwork]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);
    
    try {
      if (!selectedTicket || !price || !address) {
        throw new Error("Please select a ticket and set a price");
      }
      
      // Convert price from ETH to wei
      const priceInWei = parseEther(price).toString();
      
      // Ensure network is correct
      const networkOk = await ensureBaseSepoliaNetwork();
      if (!networkOk) {
        throw new Error("Please switch to Base Sepolia network to continue");
      }
      
      // List ticket
      await listTicket({
        ticketContract: selectedTicket.ticketContract || CONTRACT_ADDRESSES.EventTicket,
        tokenId: selectedTicket.tokenId,
        price: priceInWei,
        eventId: selectedTicket.eventId,
        eventName: selectedTicket.eventName,
        ticketType: selectedTicket.ticketType,
        originalPrice: selectedTicket.originalPrice?.toString() || "0",
        eventDate: selectedTicket.eventDate,
        location: selectedTicket.location || "Virtual Event"
      });
      
      toast.success("Ticket listed successfully!");
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push("/marketplace");
      }, 2000);
      
    } catch (error: any) {
      console.error("Error listing ticket:", error);
      setError(error.message || "Failed to list ticket. Please try again.");
      toast.error(error.message || "Failed to list ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet. Please try again.");
    }
  };
  
      const handleSelectTicket = (ticket: UserTicket) => {
    setSelectedTicket(ticket);
    setError("");
  };
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrice(value);
    
    // Validate price
    if (value && (isNaN(parseFloat(value)) || parseFloat(value) <= 0)) {
      setError("Price must be a positive number");
    } else {
      setError("");
    }
  };

  // Calculate fees and amounts
  const platformFeePercentage = 0.025; // 2.5%
  const listingPrice = price ? parseFloat(price) : 0;
  const platformFee = listingPrice * platformFeePercentage;
  const sellerReceives = listingPrice - platformFee;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 mb-6 text-cyan-400">
            <span className="text-purple-400">🏷️</span>
            <span className="text-sm font-medium">Seller Dashboard</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">List Ticket for Sale</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Set your price and list your ticket on the Marketplace
          </p>
        </div>
      </section>

      {/* Listing Form */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {!address ? (
              <div className="text-center py-16 bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700">
                <div className="text-6xl mb-6">🔐</div>
                <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
                <p className="text-gray-400 mb-8">You need to connect your wallet to list tickets for sale</p>
                <button
                  onClick={handleConnect}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 font-semibold"
                >
                  Connect Wallet
                </button>
              </div>
            ) : isLoading ? (
              <div className="text-center py-16 bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                <p className="mt-4 text-gray-400">Loading your tickets...</p>
              </div>
            ) : !availableTickets || availableTickets.length === 0 ? (
              <div className="text-center py-16 bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700">
                <div className="text-6xl mb-6">🎫</div>
                <h2 className="text-2xl font-bold text-white mb-4">No Tickets Found</h2>
                <p className="text-gray-400 mb-8">You don&apos;t have any tickets to sell. Purchase tickets first.</p>
                <Link
                  href="/events"
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 font-semibold"
                >
                  Browse Events
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
                {error && (
                  <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-200">
                    <p className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </p>
                  </div>
                )}
                
                {success && (
                  <div className="mb-6 p-4 bg-green-900/30 border border-green-800 rounded-lg text-green-200">
                    <p className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Listing created successfully! Redirecting to marketplace...
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <label htmlFor="ticket" className="block text-white font-medium mb-2">
                    Select Ticket
                  </label>
                  <div className="grid gap-3">
                    {availableTickets.map((ticket: UserTicket) => (
                      <div 
                        key={ticket.tokenId}
                        className={`p-4 border rounded-md cursor-pointer transition-colors ${
                          selectedTicket?.tokenId === ticket.tokenId
                            ? 'bg-blue-900/30 border-blue-500'
                            : 'border-slate-700 hover:bg-slate-700/50'
                        }`}
                        onClick={() => handleSelectTicket(ticket)}
                      >
                        <div className="flex justify-between">
                          <h3 className="font-medium text-white">{ticket.eventName}</h3>
                          <span className="text-sm text-gray-400">
                            Token #{ticket.tokenId}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          {ticket.ticketType} · {new Date(ticket.eventDate * 1000).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="price" className="block text-white font-medium mb-2">
                    Listing Price (ETH)
                  </label>
                  <div className="relative">
                    <input
                      id="price"
                      type="number"
                      step="0.001"
                      min="0"
                      value={price}
                      onChange={handlePriceChange}
                      className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none"
                      placeholder="0.00"
                      required
                      disabled={!selectedTicket || isSubmitting}
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">ETH</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-400">
                    Platform fee: 2.5% of sale price
                  </p>
                </div>

                <div className="mb-6">
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h3 className="text-white font-bold mb-2">Listing Summary</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Listing Price:</span>
                      <span className="text-white">{price ? `${price} ETH` : "-"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Platform Fee (2.5%):</span>
                      <span className="text-white">{price ? `${platformFee.toFixed(5)} ETH` : "-"}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-slate-600">
                      <span className="text-gray-400">You Receive:</span>
                      <span className="text-cyan-400">
                        {price ? `${sellerReceives.toFixed(5)} ETH` : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedTicket || !price || parseFloat(price) <= 0 || isListingPending || success}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {(isSubmitting || isListingPending) ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      "List Ticket for Sale"
                    )}
                  </button>
                  <Link
                    href="/marketplace"
                    className="px-6 py-3 border border-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Marketplace Info */}
      <section className="py-16 bg-slate-800/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-xl font-bold text-white mb-2">Secure Transactions</h3>
              <p className="text-gray-400">
                All marketplace transactions are secured by blockchain technology
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-xl font-bold text-white mb-2">Set Your Price</h3>
              <p className="text-gray-400">
                You decide how much your tickets are worth
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">Instant Settlement</h3>
              <p className="text-gray-400">
                Receive payment immediately when your ticket sells
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreateListingPage;