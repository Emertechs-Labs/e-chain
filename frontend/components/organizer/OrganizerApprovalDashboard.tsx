'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useOrganizerVerification, useVerifyOrganizer } from '@/app/hooks/useTransactions';
import { Loader2, CheckCircle, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface OrganizerApprovalDashboardProps {
  onApprovalSuccess?: () => void;
}

export function OrganizerApprovalDashboard({ onApprovalSuccess }: OrganizerApprovalDashboardProps) {
  const { address } = useAccount();
  const { data: verificationStatus, isLoading: verificationLoading } = useOrganizerVerification();
  const verifyOrganizerMutation = useVerifyOrganizer();
  const queryClient = useQueryClient();

  const [isProcessing, setIsProcessing] = useState(false);

  // Remove the wagmi hooks since we're using our custom hook
  // const { writeContract, data: hash, isPending } = useWriteContract();
  // const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
  //   hash,
  // });

  // Handle successful transaction
  React.useEffect(() => {
    if (verifyOrganizerMutation.isSuccess) {
      toast.success('🎉 You are now a verified organizer!');
      onApprovalSuccess?.();
    }
  }, [verifyOrganizerMutation.isSuccess, onApprovalSuccess]);

  const handlePaymentAndApproval = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      // Call the selfVerifyOrganizer function with 0.001 ETH payment
      await verifyOrganizerMutation.mutateAsync();
      
      // Success is handled in the useEffect above
    } catch (error) {
      console.error('Verification failed:', error);
      toast.error(error instanceof Error ? error.message : 'Verification failed. Please try again.');
    }
  };

  // Update processing state based on mutation state
  React.useEffect(() => {
    setIsProcessing(verifyOrganizerMutation.isPending);
  }, [verifyOrganizerMutation.isPending]);

  if (!address) {
    return (
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
        <div className="text-center">
          <Shield className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Become a Verified Organizer</h2>
          <p className="text-gray-400">Connect your wallet to start the organizer verification process</p>
        </div>
      </div>
    );
  }

  if (verificationLoading) {
    return (
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Checking verification status...
        </div>
      </div>
    );
  }

  if (verificationStatus?.isVerified) {
    return (
      <div className="bg-green-500/5 backdrop-blur-sm rounded-2xl border border-green-500/20 p-6">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-600 mb-4">Verified Organizer</h2>
          <p className="text-gray-400">
            You are already a verified organizer and can create events
          </p>
        </div>
        <div className="mt-4 flex justify-center">
          <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-green-500/20 text-green-400">
            ✓ Verified
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
      <div className="text-center mb-6">
        <Shield className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Become a Verified Organizer</h2>
        <p className="text-gray-400">
          Get verified as an organizer to start creating events
        </p>
      </div>

      <div className="space-y-6">
        {/* Testnet Warning */}
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium mb-1">
            <span className="text-lg">⚠️</span>
            <span>Testnet Environment</span>
          </div>
          <p className="text-yellow-300 text-xs">
            You&apos;re currently on Base Sepolia testnet. Use test ETH for verification. Mainnet will be available when we go live.
          </p>
        </div>

        {/* Admin Verification Info */}
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Verification Process</span>
            <div className="text-right">
              <div className="text-lg font-bold text-cyan-400">Self-Verification</div>
              <div className="text-xs text-gray-400">
                0.002 ETH fee
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Pay 0.002 ETH to become a verified organizer instantly
          </p>
          
          {/* Treasury Information */}
          <div className="border-t border-slate-600 pt-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-xs font-medium text-green-400">Secure Treasury</span>
            </div>
            <p className="text-xs text-gray-400">
              Funds sent to Echain treasury: <code className="bg-slate-800 px-1 rounded text-cyan-300">0x5474...2680D</code>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Multi-sig controlled • Timelock protected • Transparent operations
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handlePaymentAndApproval}
          disabled={isProcessing || verifyOrganizerMutation.isPending}
          className="bg-cyan-600 text-white px-4 py-3 rounded-lg hover:bg-cyan-500 transition-colors w-full font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {verifyOrganizerMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Waiting for Signature...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              Pay 0.002 ETH & Get Verified
            </>
          )}
        </button>

        {/* Status Information */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-green-400">
            <CheckCircle className="h-4 w-4" />
            <span>100% Automatic - No manual approval needed!</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-yellow-400">
            <span className="text-xs">💰</span>
            <span>0.002 ETH (~$5) verification fee required</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Instant verification after payment</span>
          </div>
          
          {/* Security Assurances */}
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mt-4">
            <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security Assurances
            </h4>
            <div className="space-y-1 text-xs text-green-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span>Funds go directly to secure treasury</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span>No access to your other assets</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span>Reentrancy & pause protection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span>Transparent on-chain operations</span>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            By proceeding, you agree to our terms of service and organizer guidelines
          </p>
        </div>
      </div>
    </div>
  );
}