"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useCreateEvent } from "../../hooks/useTransactions";
import SignAndSendUnsignedTx from '../../../components/SignAndSendUnsignedTx';
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TransactionStatus, usePendingTransactions } from "../../components/TransactionStatus";

interface EventForm {
  name: string;
  description: string;
  venue: string;
  category: string;
  startDate: string;
  endDate: string;
  maxTickets: string;
  ticketPrice: string;
  saleEndDate: string;
  imageUrl: string;
}

const CreateEventPage: React.FC = () => {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const createEventMutation = useCreateEvent();
  const [isLoading, setIsLoading] = useState(false);
  const [preparedPayload, setPreparedPayload] = useState<Record<string, any> | null>(null);
  const { pendingTxs, addTransaction, removeTransaction } = usePendingTransactions();
  const [formData, setFormData] = useState<EventForm>({
    name: "",
    description: "",
    venue: "",
    category: "",
    startDate: "",
    endDate: "",
    maxTickets: "",
    ticketPrice: "",
    saleEndDate: "",
    imageUrl: ""
  });
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1); // At least 1 hour from now
    return now.toISOString().slice(0, 16); // Format for datetime-local
  };

  const getMaxStartDateTime = (endDate: string) => {
    if (!endDate) return '';
    const end = new Date(endDate);
    end.setHours(end.getHours() - 1); // Start must be at least 1 hour before end
    return end.toISOString().slice(0, 16);
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check required fields
    if (!formData.name.trim()) errors.push("Event name is required");
    if (!formData.description.trim()) errors.push("Description is required");
    if (!formData.venue.trim()) errors.push("Venue is required");
    if (!formData.category) errors.push("Category is required");
    if (!formData.startDate) errors.push("Start date is required");
    if (!formData.endDate) errors.push("End date is required");
    if (!formData.saleEndDate) errors.push("Sale end date is required");
    if (!formData.maxTickets) errors.push("Maximum tickets is required");
    if (!formData.ticketPrice) errors.push("Ticket price is required");

    // Check numeric validations
    const maxTickets = parseInt(formData.maxTickets);
    const ticketPrice = parseFloat(formData.ticketPrice);
    
    if (isNaN(maxTickets) || maxTickets <= 0) {
      errors.push("Maximum tickets must be a positive number");
    }
    
    if (isNaN(ticketPrice) || ticketPrice < 0) {
      errors.push("Ticket price must be a valid non-negative number");
    }

    // Check date validations
    if (formData.startDate && formData.endDate && formData.saleEndDate) {
      const startTime = new Date(formData.startDate).getTime();
      const endTime = new Date(formData.endDate).getTime();
      const saleEndTime = new Date(formData.saleEndDate).getTime();
      const now = Date.now();
      const oneHourFromNow = now + 3600 * 1000;

      if (isNaN(startTime) || isNaN(endTime) || isNaN(saleEndTime)) {
        errors.push("Invalid date format");
      } else {
        if (startTime <= oneHourFromNow) {
          errors.push("Event start time must be at least 1 hour in the future");
        }
        
        if (endTime <= startTime) {
          errors.push("Event end time must be after start time");
        }
        
        if (endTime - startTime < 3600 * 1000) { // At least 1 hour duration
          errors.push("Event must be at least 1 hour long");
        }
        
        if (saleEndTime >= startTime) {
          errors.push("Ticket sales must end before the event starts");
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const validation = validateForm();
  const isFormValid = validation.isValid && isConnected;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getMaxSaleEndDateTime = (startDate: string) => {
    if (!startDate) return '';
    const start = new Date(startDate);
    start.setMinutes(start.getMinutes() - 1); // Sale end must be before start
    return start.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use the validation function
    const validation = validateForm();
    if (!validation.isValid) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    try {
      // Convert form data to contract parameters
      const startTime = Math.floor(new Date(formData.startDate).getTime() / 1000);
      const endTime = Math.floor(new Date(formData.endDate).getTime() / 1000);
      const saleEndTime = Math.floor(new Date(formData.saleEndDate).getTime() / 1000);

      const eventData = {
        name: formData.name,
        metadataURI: formData.imageUrl || "ipfs://placeholder", // TODO: Upload to IPFS
        ticketPrice: (parseFloat(formData.ticketPrice) * 1e18).toString(), // Convert ETH to wei
        maxTickets: parseInt(formData.maxTickets),
        startTime,
        endTime
      };

      // Prepare payload for server-side unsigned tx creation
      const payload = {
        address: 'eventfactory',
        contractLabel: 'eventfactory',
        method: 'createEvent',
        blockchain: 'eip155-84532',
        args: [
          eventData.name,
          eventData.metadataURI,
          String(eventData.ticketPrice),
          String(eventData.maxTickets),
          String(eventData.startTime),
          String(eventData.endTime)
        ],
        from: address ?? undefined, // prefer connected wallet address
        autoStart: true,
        traceId: `create-event-${Date.now()}`
      } as Record<string, any>;

      // Store prepared payload and flip UI to show wallet signing component
      setPreparedPayload(payload);
      toast.dismiss();
      setIsLoading(false);
    } catch (error: any) {
      toast.dismiss();
      setIsLoading(false);
      toast.error(error.message || "Failed to create event. Please try again.");
    }
  };  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🔗</div>
          <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8">You need to connect your wallet to create events</p>
          <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 font-semibold">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 mb-6 text-cyan-400">
            <span className="text-purple-400">➕</span>
            <span className="text-sm font-medium">Event Creation</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Create New Event</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Launch your blockchain-verified event with NFT tickets and transparent operations.
          </p>
        </div>
      </section>

      {/* Form */}
  <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Event Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none"
                      placeholder="Web3 Developer Conference 2024"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      aria-label="Event Category"
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="">Select Category</option>
                      <option value="Technology">Technology</option>
                      <option value="Art">Art & Culture</option>
                      <option value="Music">Music</option>
                      <option value="Business">Business</option>
                      <option value="Education">Education</option>
                      <option value="Sports">Sports</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none"
                    placeholder="Describe your event, what attendees can expect, speakers, agenda, etc."
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Venue *
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none"
                    placeholder="Convention Center, San Francisco CA"
                  />
                </div>
              </div>

              {/* Event Schedule */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Event Schedule</h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Event Start Date *
                    </label>
                    <input
                      type="datetime-local"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      min={getMinDateTime()}
                      max={getMaxStartDateTime(formData.endDate)}
                      placeholder="Select event start date and time"
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Event End Date *
                    </label>
                    <input
                      type="datetime-local"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      min={formData.startDate || getMinDateTime()}
                      placeholder="Select event end date and time"
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ticket Sales End *
                    </label>
                    <input
                      type="datetime-local"
                      name="saleEndDate"
                      value={formData.saleEndDate}
                      onChange={handleInputChange}
                      required
                      max={getMaxSaleEndDateTime(formData.startDate)}
                      placeholder="Select ticket sales end date and time"
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Ticketing */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Ticketing</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Maximum Tickets *
                    </label>
                    <input
                      type="number"
                      name="maxTickets"
                      value={formData.maxTickets}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none"
                      placeholder="500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ticket Price (ETH) *
                    </label>
                    <input
                      type="number"
                      name="ticketPrice"
                      value={formData.ticketPrice}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.001"
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none"
                      placeholder="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              {formData.name && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Preview</h2>
                  <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                    <h3 className="text-xl font-bold text-white mb-2">{formData.name}</h3>
                    <p className="text-gray-400 mb-4">{formData.description}</p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="text-gray-300">
                        <span className="text-cyan-400">📍</span> {formData.venue}
                      </div>
                      <div className="text-gray-300">
                        <span className="text-cyan-400">🏷️</span> {formData.category}
                      </div>
                      <div className="text-gray-300">
                        <span className="text-cyan-400">🎫</span> {formData.maxTickets} tickets
                      </div>
                      <div className="text-gray-300">
                        <span className="text-cyan-400">💰</span> {formData.ticketPrice} ETH
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Status */}
              {pendingTxs.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Transaction Status</h2>
                  <div className="space-y-4">
                    {pendingTxs.map((tx) => (
                      <TransactionStatus
                        key={tx.hash}
                        hash={tx.hash}
                        description={tx.description}
                        onComplete={() => {
                          removeTransaction(tx.hash);
                          toast.success("Event created successfully!");
                          router.push('/my-events');
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button / Wallet signing flow */}
              <div className="text-center">
                {/* Validation Errors */}
                {!validation.isValid && validation.errors.length > 0 && (
                  <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <h3 className="text-red-400 font-semibold mb-2">Please fix the following issues:</h3>
                    <ul className="text-red-300 text-sm space-y-1">
                      {validation.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Wallet Connection Warning */}
                {!isConnected && (
                  <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-300">⚠️ Please connect your wallet to create events</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isFormValid || isLoading}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-12 py-4 rounded-lg hover:from-cyan-400 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 font-bold text-lg"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Preparing Transaction...
                    </span>
                  ) : !isConnected ? (
                    "🔗 Connect Wallet to Create Event"
                  ) : !validation.isValid ? (
                    "⚠️ Complete Form to Create Event"
                  ) : (
                    "🚀 Create Event"
                  )}
                </button>
                <p className="text-gray-400 text-sm mt-4">
                  Creating an event will deploy a smart contract and mint NFT tickets
                </p>
              </div>

              {/* Wallet signing area: rendered only when we have a prepared payload */}
              {preparedPayload && (
                <div id="wallet-sign-area" className="mt-6">
                  <SignAndSendUnsignedTx
                    payload={preparedPayload}
                    label={`Sign & Send: Create ${formData.name}`}
                    onSubmitted={(txHash) => {
                      // txHash is a string; cast to the template literal type expected by addTransaction
                      addTransaction(txHash as `0x${string}`, `Create Event: ${formData.name}`);
                      toast.success('Transaction submitted! Waiting for confirmation...');
                      // Let TransactionStatus handle completion and navigation
                    }}
                  />
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreateEventPage;
