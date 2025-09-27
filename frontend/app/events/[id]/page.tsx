"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEvent } from "../../hooks/useEvents";

const EventDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const eventId = parseInt(params.id as string);
  const { data: event, isLoading: loading } = useEvent(eventId);
  
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchaseTickets = async () => {
    if (!isConnected || !event) return;
    
    setIsPurchasing(true);
    try {
      // TODO: Implement contract interaction to purchase tickets
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Successfully purchased ${ticketQuantity} ticket(s)!`);
      router.push("/my-tickets");
    } catch (error) {
      console.error("Error purchasing tickets:", error);
      alert("Failed to purchase tickets. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const formatPrice = (price: bigint) => {
    return (Number(price) / 1e18).toFixed(4);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const isEventActive = event && event.saleEndTime > Math.floor(Date.now() / 1000) && event.isActive;
  const totalPrice = event ? Number(event.ticketPrice) * ticketQuantity : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push("/events")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          ← Back to Events
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.name}</h1>
                    <div className="flex items-center gap-4 text-gray-600">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {event.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isEventActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isEventActive ? 'Active' : 'Ended'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Event Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Venue:</span>
                        <span className="font-medium">{event.venue || 'TBA'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Organizer:</span>
                        <span className="font-medium font-mono text-xs">
                          {event.organizer.slice(0, 6)}...{event.organizer.slice(-4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Symbol:</span>
                        <span className="font-medium">{event.symbol}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Ticket Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Price:</span>
                        <span className="font-medium">{formatPrice(event.ticketPrice)} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Max Tickets:</span>
                        <span className="font-medium">{event.maxTickets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Sale Ends:</span>
                        <span className="font-medium">{formatDate(event.saleEndTime)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {event.description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{event.description}</p>
                  </div>
                )}
              </div>

              {/* Contract Information */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Contract Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="text-gray-500">Ticket Contract:</span>
                      <div className="font-mono text-xs mt-1">{event.ticketContract}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Purchase Tickets</h2>
              
              {!isConnected ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Connect your wallet to purchase tickets</p>
                  <ConnectButton />
                </div>
              ) : !isEventActive ? (
                <div className="text-center">
                  <div className="text-4xl mb-3">⏰</div>
                  <p className="text-gray-600 font-medium">Ticket sales have ended</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <select
                      value={ticketQuantity}
                      onChange={(e) => setTicketQuantity(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Price per ticket:</span>
                      <span className="font-medium">{formatPrice(event.ticketPrice)} ETH</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{ticketQuantity}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Total:</span>
                        <span className="font-bold text-lg">{(totalPrice / 1e18).toFixed(4)} ETH</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePurchaseTickets}
                    disabled={isPurchasing}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isPurchasing ? "Processing..." : "Purchase Tickets"}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Tickets are NFTs that will be minted to your wallet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
