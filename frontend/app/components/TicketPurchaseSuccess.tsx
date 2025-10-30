'use client';

import { useState } from 'react';
import { Check, ExternalLink, Share2 } from 'lucide-react';
import Link from 'next/link';

interface TicketPurchaseSuccessProps {
  eventName: string;
  eventId: number;
  quantity: number;
  txHash?: string;
  onClose: () => void;
}

export function TicketPurchaseSuccess({ 
  eventName, 
  eventId, 
  quantity, 
  txHash,
  onClose 
}: TicketPurchaseSuccessProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const shareData = {
        title: `Just got my NFT ticket for ${eventName}!`,
        text: `I just purchased ${quantity} NFT ticket${quantity > 1 ? 's' : ''} for ${eventName} on Echain! 🎫`,
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareData.url);
        alert('Event link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 max-w-md w-full mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Purchase Successful! 🎉</h2>
          <p className="text-gray-400">
            You&apos;ve successfully purchased {quantity} NFT ticket{quantity > 1 ? 's' : ''} for
          </p>
          <p className="text-cyan-400 font-semibold">{eventName}</p>
        </div>

        {/* Transaction Details */}
        {txHash && (
          <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Transaction:</span>
              <a
                href={`https://sepolia.basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm"
              >
                View on BaseScan
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/my-tickets"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 font-semibold text-center block"
          >
            View My Tickets
          </Link>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="flex items-center justify-center gap-2 bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-600 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              {isSharing ? 'Sharing...' : 'Share'}
            </button>
            
            <button
              onClick={onClose}
              className="bg-slate-600 text-white py-2 rounded-lg hover:bg-slate-500 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <h3 className="text-blue-400 font-semibold mb-2">What&apos;s Next?</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Your NFT tickets are now in your wallet</li>
            <li>• You can view them in &quot;My Tickets&quot; section</li>
            <li>• Transfer or sell them on the marketplace</li>
            <li>• Claim POAPs after attending the event</li>
          </ul>
        </div>
      </div>
    </div>
  );
}