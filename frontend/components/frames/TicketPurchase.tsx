/**
 * Event Ticket Purchase Component for Farcaster Frames
 * Handles ticket purchases through MiniKit Smart Wallet
 */

'use client';

import { useState } from 'react';
import { useMiniKitWallet } from '@/hooks/useMiniKitWallet';
import { useFarcasterAnalytics } from '@/hooks/useFarcasterFrame';
import { parseEther } from 'viem';
import { formatErrorMessage, isRetryableError, getRecoveryAction } from '@/lib/wallet-errors';

interface TicketPurchaseProps {
  eventId: string;
  eventName: string;
  ticketPrice: string;
  contractAddress: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
}

export function TicketPurchase({
  eventId,
  eventName,
  ticketPrice,
  contractAddress,
  onSuccess,
  onError,
}: TicketPurchaseProps) {
  const {
    address,
    isConnected,
    isConnecting,
    connectWallet,
    sendTransaction,
    error: walletError,
  } = useMiniKitWallet();

  const { trackPurchase, trackConnect, trackEngage } = useFarcasterAnalytics();

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRetryable, setIsRetryable] = useState(false);
  const [recoveryAction, setRecoveryAction] = useState<string | null>(null);

  const handlePurchase = async () => {
    try {
      setError(null);
      setIsPurchasing(true);

      // Track engagement
      trackEngage(eventId, 'purchase_initiated');

      // Connect wallet if not connected
      if (!isConnected) {
        const walletAddress = await connectWallet();
        if (!walletAddress) {
          throw new Error('Failed to connect wallet');
        }
        // Track wallet connection
        trackConnect(eventId, walletAddress);
      }

      // Encode mint function call
      // mintTicket(uint256 eventId, uint256 quantity)
      const mintData = encodeMintTicket(eventId, 1);

      // Send transaction
      const hash = await sendTransaction({
        to: contractAddress,
        value: parseEther(ticketPrice),
        data: mintData,
      });

      setTxHash(hash);
      trackPurchase(eventId, ticketPrice, 1);

      onSuccess?.(hash);
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      const retryable = isRetryableError(err);
      const recovery = getRecoveryAction(err);

      setError(errorMessage);
      setIsRetryable(retryable);
      setRecoveryAction(recovery);
      onError?.(errorMessage);
    } finally {
      setIsPurchasing(false);
    }
  };

  // Show wallet connection button
  if (!isConnected) {
    return (
      <div className="space-y-4">
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
        {walletError && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{walletError}</div>
        )}
      </div>
    );
  }

  // Show purchase interface
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Event</span>
          <span className="font-medium">{eventName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Ticket Price</span>
          <span className="font-medium">{ticketPrice} ETH</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Wallet</span>
          <span className="font-mono text-xs">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
          </span>
        </div>
      </div>

      {txHash ? (
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-green-800 font-medium mb-2">✓ Purchase Successful!</div>
          <a
            href={`https://basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm font-mono break-all"
          >
            {txHash}
          </a>
        </div>
      ) : (
        <button
          onClick={handlePurchase}
          disabled={isPurchasing}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPurchasing ? 'Processing...' : `Purchase Ticket (${ticketPrice} ETH)`}
        </button>
      )}

      {error && (
        <div className="bg-red-50 p-4 rounded-lg space-y-2">
          <div className="text-red-800 font-medium">⚠️ {error}</div>
          {recoveryAction && (
            <div className="text-sm text-red-600">💡 {recoveryAction}</div>
          )}
          {isRetryable && (
            <button
              onClick={handlePurchase}
              className="text-sm text-red-700 hover:text-red-900 underline"
            >
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Encode mintTicket function call
 * function mintTicket(uint256 eventId, uint256 quantity) external payable
 */
function encodeMintTicket(eventId: string, quantity: number): `0x${string}` {
  // Function selector: keccak256("mintTicket(uint256,uint256)")
  const selector = '0x1234abcd'; // TODO: Replace with actual function selector

  // Encode parameters
  const eventIdHex = BigInt(eventId).toString(16).padStart(64, '0');
  const quantityHex = BigInt(quantity).toString(16).padStart(64, '0');

  return `${selector}${eventIdHex}${quantityHex}` as `0x${string}`;
}
