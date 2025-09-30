'use client';

import React from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';
import { CheckCircle, Clock, XCircle, ExternalLink } from 'lucide-react';

interface TransactionStatusProps {
  hash: `0x${string}`;
  onComplete?: () => void;
  description?: string;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({
  hash,
  onComplete,
  description = "Transaction"
}) => {
  const { data: receipt, isLoading, isSuccess, isError } = useWaitForTransactionReceipt({
    hash,
  });

  React.useEffect(() => {
    if (isSuccess && onComplete) {
      onComplete();
    }
  }, [isSuccess, onComplete]);

  const getStatusInfo = () => {
    if (isLoading) {
      return {
        icon: <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />,
        text: 'Pending',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10'
      };
    }
    if (isSuccess) {
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        text: 'Confirmed',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10'
      };
    }
    if (isError) {
      return {
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        text: 'Failed',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10'
      };
    }
    return {
      icon: <Clock className="h-5 w-5 text-gray-500" />,
      text: 'Unknown',
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10'
    };
  };

  const statusInfo = getStatusInfo();

  const blockExplorerUrl = `https://sepolia.basescan.org/tx/${hash}`;

  return (
    <div className={`p-4 rounded-lg border ${statusInfo.bgColor} border-current/20`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {statusInfo.icon}
          <div>
            <p className="font-medium text-white">{description}</p>
            <p className={`text-sm ${statusInfo.color}`}>
              {statusInfo.text}
              {receipt && ` • Block #${receipt.blockNumber}`}
            </p>
          </div>
        </div>
        <a
          href={blockExplorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="text-sm">View</span>
        </a>
      </div>
      <div className="mt-2 text-xs text-gray-400 font-mono">
        {hash.slice(0, 10)}...{hash.slice(-8)}
      </div>
    </div>
  );
};

// Hook to manage pending transactions
export const usePendingTransactions = () => {
  const [pendingTxs, setPendingTxs] = React.useState<Array<{
    hash: `0x${string}`;
    description: string;
    timestamp: number;
  }>>([]);

  const addTransaction = React.useCallback((hash: `0x${string}`, description: string) => {
    setPendingTxs(prev => [...prev, {
      hash,
      description,
      timestamp: Date.now()
    }]);
  }, []);

  const removeTransaction = React.useCallback((hash: `0x${string}`) => {
    setPendingTxs(prev => prev.filter(tx => tx.hash !== hash));
  }, []);

  return {
    pendingTxs,
    addTransaction,
    removeTransaction
  };
};