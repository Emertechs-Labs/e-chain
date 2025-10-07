"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle, XCircle, ExternalLink, Calendar, MapPin, User } from 'lucide-react';

// Prevent static rendering
export const dynamic = 'force-dynamic';

interface VerificationData {
  eventId: number;
  eventName: string;
  organizer: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  ticketId?: number;
  attendeeAddress?: string;
  verified: boolean;
  verificationUrl: string;
  ipfsTimestamp: number;
}

const VerifyPage: React.FC = () => {
  const searchParams = useSearchParams();
  const ipfsCid = searchParams.get('cid');
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVerificationData = async () => {
      if (!ipfsCid) {
        setError('No verification ID provided');
        setLoading(false);
        return;
      }

      try {
        // Fetch verification data from IPFS
        const response = await fetch(`https://ipfs.io/ipfs/${ipfsCid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch verification data');
        }

        const data: VerificationData = await response.json();
        setVerificationData(data);
      } catch (err) {
        console.error('Error fetching verification data:', err);
        setError('Failed to load verification data');
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationData();
  }, [ipfsCid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading verification data...</p>
        </div>
      </div>
    );
  }

  if (error || !verificationData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Verification Failed</h1>
          <p className="text-gray-400 mb-6">
            {error || 'Unable to verify this ticket or event poster.'}
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-slate-700 text-white px-6 py-2 rounded-lg hover:bg-slate-600 transition-colors"
          >
            Go Back
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
          <div className="inline-flex items-center gap-2 mb-6 text-green-400">
            <CheckCircle className="h-8 w-8" />
            <span className="text-sm font-medium">Verified</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Blockchain Verification</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            This ticket/event has been verified on the blockchain. All details are cryptographically secured and immutable.
          </p>
        </div>
      </section>

      {/* Verification Details */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Event/Ticket Info */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-cyan-400" />
                {verificationData.ticketId ? 'Ticket Details' : 'Event Details'}
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      {verificationData.ticketId ? 'Ticket For' : 'Event Name'}
                    </label>
                    <p className="text-white text-lg font-semibold">{verificationData.eventName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Organizer
                    </label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-white font-mono text-sm">{verificationData.organizer}</span>
                    </div>
                  </div>

                  {verificationData.ticketId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Ticket ID
                      </label>
                      <p className="text-cyan-400 font-mono">#{verificationData.ticketId}</p>
                    </div>
                  )}

                  {verificationData.attendeeAddress && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Attendee Address
                      </label>
                      <p className="text-white font-mono text-sm">{verificationData.attendeeAddress}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Verification Timestamp
                    </label>
                    <p className="text-white">
                      {new Date(verificationData.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      IPFS Timestamp
                    </label>
                    <p className="text-white">
                      {new Date(verificationData.ipfsTimestamp).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Block Number
                    </label>
                    <p className="text-cyan-400 font-mono">#{verificationData.blockNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ExternalLink className="h-6 w-6 text-cyan-400" />
                Transaction Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Transaction Hash
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-mono text-sm bg-slate-700 px-3 py-1 rounded">
                      {verificationData.transactionHash}
                    </span>
                    <a
                      href={verificationData.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                      title="View transaction on blockchain explorer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    IPFS Content ID
                  </label>
                  <span className="text-white font-mono text-sm bg-slate-700 px-3 py-1 rounded block">
                    {ipfsCid}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-green-900/20 border border-green-500/30 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-4">
                <CheckCircle className="h-8 w-8 text-green-400" />
                <h3 className="text-xl font-bold text-green-400">Verification Successful</h3>
              </div>
              <p className="text-green-300 mb-4">
                This {verificationData.ticketId ? 'ticket' : 'event poster'} has been verified as authentic and originates from the Echain blockchain platform.
              </p>
              <div className="text-sm text-green-400/80">
                <p>• Cryptographically signed and timestamped</p>
                <p>• Stored immutably on IPFS and blockchain</p>
                <p>• Verified against original transaction data</p>
              </div>
            </div>

            {/* Actions */}
            <div className="text-center mt-8">
              <button
                onClick={() => window.history.back()}
                className="bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-600 transition-colors mr-4"
              >
                Go Back
              </button>
              <a
                href={verificationData.verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-400 transition-colors inline-flex items-center gap-2"
              >
                View on Blockchain Explorer
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VerifyPage;