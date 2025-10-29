"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useOrganizerVerification, useVerifyOrganizer } from "../../hooks/useTransactions";
import { useCreateEventDirect } from "../../hooks/useTransactionsDirect"; // Direct wallet transaction
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { uploadToIPFS, uploadEventMetadata, generateEventPosterWithQR } from "../../../lib/ipfs";
import Image from "next/image";
import { SimpleLocationPicker } from "../../components/maps/SimpleLocationPicker";
import { EnhancedConnectButton } from "../../components/EnhancedConnectButton";

interface EventForm {
  name: string;
  description: string;
  venue: string;
  coordinates?: { lat: number; lng: number };
  category: string;
  startDate: string;
  endDate: string;
  maxTickets: string;
  ticketPrice: string;
  saleEndDate: string;
  imageUrl: string;
}

interface ImageUploadState {
  file: File | null;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  ipfsUrl: string;
}

const CreateEventPage: React.FC = () => {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const createEventMutation = useCreateEventDirect(); // ✅ Using direct wallet hook
  const { data: verificationStatus, isLoading: verificationLoading } = useOrganizerVerification();
  const verifyOrganizerMutation = useVerifyOrganizer();
  const [isLoading, setIsLoading] = useState(false);
  const [imageUpload, setImageUpload] = useState<ImageUploadState>({
    file: null,
    preview: '',
    uploading: false,
    uploaded: false,
    ipfsUrl: ''
  });
  const [formData, setFormData] = useState<EventForm>({
    name: "",
    description: "",
    venue: "",
    coordinates: undefined,
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

    if (!formData.name.trim()) errors.push("Event name is required");
    if (!formData.description.trim()) errors.push("Description is required");
    if (!formData.venue.trim()) errors.push("Venue is required");
    if (!formData.category) errors.push("Category is required");
    if (!formData.startDate) errors.push("Start date is required");
    if (!formData.endDate) errors.push("End date is required");
    if (!formData.saleEndDate) errors.push("Sale end date is required");
    if (!formData.maxTickets) errors.push("Maximum tickets is required");
    if (!formData.ticketPrice) errors.push("Ticket price is required");
    if (!imageUpload.uploaded && !formData.imageUrl) errors.push("Event poster is required (upload an image for verification QR code generation) - this is mandatory for event creation");

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size must be less than 5MB');
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    setImageUpload(prev => ({
      ...prev,
      file,
      preview,
      uploading: true,
      uploaded: false,
      ipfsUrl: ''
    }));

    try {
      // Upload to IPFS
      const result = await uploadToIPFS(file);

      if (result.success) {
        setImageUpload(prev => ({
          ...prev,
          uploading: false,
          uploaded: true,
          ipfsUrl: result.url
        }));

        // Update form data with IPFS URL
        setFormData(prev => ({
          ...prev,
          imageUrl: result.url
        }));

        toast.success('Image uploaded to IPFS successfully!');
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setImageUpload(prev => ({
        ...prev,
        uploading: false,
        uploaded: false,
        ipfsUrl: ''
      }));
      toast.error('Failed to upload image to IPFS. Please try again.');
    }
  };

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

    // Prevent multiple submissions
    if (isLoading || createEventMutation.isPending) {
      console.log('[CreateEventPage] Ignoring duplicate submit - already processing');
      return;
    }

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

    // Check verification status
    if (verificationLoading) {
      toast.info("Checking organizer verification status...");
      return;
    }

    if (!verificationStatus?.isVerified) {
      toast.error("You need to be verified as an organizer to create events. Redirecting to verification page...", {
        duration: 4000,
      });
      router.push('/organizer/approval');
      return;
    }

    setIsLoading(true);
    try {
      // Create comprehensive event metadata
      const eventMetadata = {
        name: formData.name,
        description: formData.description,
        venue: formData.venue,
        coordinates: formData.coordinates, // Include coordinates for heat maps and precise location data
        category: formData.category,
        image: imageUpload.ipfsUrl || formData.imageUrl || "",
        attributes: [
          { trait_type: "Event Type", value: formData.category },
          { trait_type: "Venue", value: formData.venue },
          ...(formData.coordinates ? [
            { trait_type: "Latitude", value: formData.coordinates.lat.toString() },
            { trait_type: "Longitude", value: formData.coordinates.lng.toString() }
          ] : []),
          { trait_type: "Max Tickets", value: formData.maxTickets.toString() },
          { trait_type: "Ticket Price", value: `${formData.ticketPrice} ETH` },
          { trait_type: "Start Date", value: new Date(formData.startDate).toISOString() },
          { trait_type: "End Date", value: new Date(formData.endDate).toISOString() },
          { trait_type: "Sale End Date", value: new Date(formData.saleEndDate).toISOString() },
          { trait_type: "Organizer", value: address || "Unknown" },
          { trait_type: "Blockchain", value: "Base Sepolia" }
        ]
      };

      // Upload event metadata to IPFS
      console.log('[CreateEventPage] Uploading event metadata to IPFS...');
      const metadataResult = await uploadEventMetadata(eventMetadata);

      if (!metadataResult.success) {
        throw new Error(`Failed to upload metadata: ${metadataResult.error}`);
      }

      console.log('[CreateEventPage] Metadata uploaded successfully:', metadataResult.url);

      // Convert form data to contract parameters
      const startTime = Math.floor(new Date(formData.startDate).getTime() / 1000);
      const endTime = Math.floor(new Date(formData.endDate).getTime() / 1000);

      const eventData = {
        name: formData.name,
        metadataURI: metadataResult.url, // Use the full metadata IPFS URL
        ticketPrice: formData.ticketPrice, // Keep as string, hook will convert to wei
        maxTickets: parseInt(formData.maxTickets),
        startTime,
        endTime
      };

      // Use the direct hook to create the event
      await createEventMutation.mutateAsync(eventData);

      toast.success("Event created successfully!");
      router.push('/my-events');
    } catch (error: any) {
      console.error('[CreateEventPage] Error creating event:', error);
      toast.error(error.message || "Failed to create event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-6">🔗</div>
          <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8">You need to connect your wallet to create events</p>
          <div className="flex justify-center">
            <EnhancedConnectButton />
          </div>
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
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Launch your blockchain-verified event with NFT tickets and transparent operations.
          </p>

          {/* Verification Info */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700 p-6 max-w-2xl mx-auto mb-8">
            <div className="flex items-start gap-3">
              <div className="text-cyan-400 text-2xl mt-1">ℹ️</div>
              <div>
                <h3 className="text-white font-semibold mb-2">Organizer Verification Required</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  To ensure quality events and prevent spam, all event organizers must be verified.
                  Get verified instantly by paying a one-time $1 fee - no manual approval needed!
                  Choose between crypto payment (ETH) or card payment (Stripe).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Verification Status Card */}
            {isConnected && (
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-3 h-3 rounded-full ${verificationStatus?.isVerified ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                  <h3 className="text-xl font-bold text-white">
                    {verificationStatus?.isVerified ? '✅ Organizer Verified' : '⚠️ Verification Required'}
                  </h3>
                </div>

                {verificationLoading ? (
                  <div className="flex items-center gap-2 text-slate-300">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                    Checking verification status...
                  </div>
                ) : verificationStatus?.isVerified ? (
                  <p className="text-slate-300">
                    Your account is verified and ready to create events. You can proceed with event creation.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <p className="text-slate-300">
                      To create events on Echain, your organizer account must be verified.
                      Get verified instantly by paying a one-time $1 fee.
                    </p>

                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
                      <h4 className="text-white font-semibold mb-2">How to Get Verified:</h4>
                      <ul className="text-slate-300 space-y-1 text-sm">
                        <li>• Pay a one-time $1 verification fee</li>
                        <li>• Choose crypto payment (ETH) or card (Stripe)</li>
                        <li>• Get verified instantly and automatically</li>
                        <li>• Start creating events immediately</li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => router.push('/organizer/approval')}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-200 font-semibold"
                    >
                      � Get Verified Now (Pay $1)
                    </button>
                  </div>
                )}
              </div>
            )}

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
                    Event Poster * <span className="text-red-400">(Required)</span>
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="block w-full">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={imageUpload.uploading}
                          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-400 disabled:opacity-50"
                          title="Select event poster for QR code verification"
                        />
                      </label>
                      {imageUpload.uploading && (
                        <div className="flex items-center gap-2 text-cyan-400">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                          <span className="text-sm">Uploading...</span>
                        </div>
                      )}
                    </div>

                    {imageUpload.preview && (
                      <div className="relative">
                        <Image
                          src={imageUpload.preview}
                          alt="Event poster preview"
                          width={400}
                          height={192}
                          className="w-full max-w-md h-48 object-cover rounded-lg border border-slate-600"
                        />
                        {imageUpload.uploaded && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                            ✓ Poster Uploaded to IPFS
                          </div>
                        )}
                      </div>
                    )}

                    {imageUpload.ipfsUrl && (
                      <div className="text-sm text-gray-400">
                        <span className="text-cyan-400">IPFS URL:</span> {imageUpload.ipfsUrl}
                      </div>
                    )}

                    <div className="text-xs text-gray-500 bg-slate-700/50 p-3 rounded-lg">
                      <strong>📱 QR Code Verification:</strong> Your event poster will be enhanced with a QR code that attendees can scan to verify ticket authenticity and view transaction details on the blockchain.
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Venue * <span className="text-cyan-400">(Interactive Map)</span>
                  </label>
                  <SimpleLocationPicker
                    value={formData.venue}
                    onChange={(address, coordinates) => setFormData(prev => ({ ...prev, venue: address, coordinates }))}
                    placeholder="Enter event location or select from popular venues"
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
                  disabled={!isFormValid || isLoading || verificationLoading || !verificationStatus?.isVerified}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-12 py-4 rounded-lg hover:from-cyan-400 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 font-bold text-lg"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Preparing Transaction...
                    </span>
                  ) : verificationLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Checking Verification...
                    </span>
                  ) : !isConnected ? (
                    "🔗 Connect Wallet to Create Event"
                  ) : !verificationStatus?.isVerified ? (
                    "⚠️ Get Verified to Create Events"
                  ) : !validation.isValid ? (
                    "⚠️ Complete Form (Poster Required)"
                  ) : (
                    "🚀 Create Event"
                  )}
                </button>
                <p className="text-gray-400 text-sm mt-4">
                  Creating an event will deploy a smart contract and mint NFT tickets
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreateEventPage;
