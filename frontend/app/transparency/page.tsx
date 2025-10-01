"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Transaction {
  id: string;
  type: "mint" | "royalty" | "transfer" | "create";
  event: string;
  blockNumber: string;
  hash: string;
  timestamp: string;
  gas: string;
  amount: string;
  description: string;
}

// TODO: Replace with real blockchain transaction data from an API endpoint
// For now, transactions will be fetched from blockchain indexer or events
const mockTransactions: Transaction[] = [];

const TransparencyPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All Transactions");

  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "mint": return "🎫";
      case "royalty": return "💰";
      case "transfer": return "↔️";
      case "create": return "🎪";
      default: return "📝";
    }
  };

  const getTransactionColor = (type: Transaction["type"]) => {
    switch (type) {
      case "mint": return "text-green-400";
      case "royalty": return "text-yellow-400";
      case "transfer": return "text-blue-400";
      case "create": return "text-purple-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 mb-6 text-cyan-400">
            <span className="text-green-400">⭕</span>
            <span className="text-sm font-medium">Blockchain Verified</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Transparency Log</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Every action on our platform is recorded on the blockchain. View real-time transaction history for complete transparency.
          </p>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-8 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700">
              <div className="text-3xl font-bold text-cyan-400 mb-1">0</div>
              <div className="text-gray-400 text-sm">Total Transactions</div>
              <p className="text-gray-500 text-xs mt-2">Real-time blockchain data</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700">
              <div className="text-3xl font-bold text-cyan-400 mb-1">0 ETH</div>
              <div className="text-gray-400 text-sm">Volume Today</div>
              <p className="text-gray-500 text-xs mt-2">Updates as events occur</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700">
              <div className="text-3xl font-bold text-green-400 mb-1">0</div>
              <div className="text-gray-400 text-sm">Tickets Minted</div>
              <p className="text-gray-500 text-xs mt-2">Blockchain-verified mints</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700">
              <div className="text-3xl font-bold text-purple-400 mb-1">0 ETH</div>
              <div className="text-gray-400 text-sm">Royalties Paid</div>
              <p className="text-gray-500 text-xs mt-2">On-chain royalty tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by event, transaction hash, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none"
                  aria-label="Filter transactions by type"
                >
                  <option>All Transactions</option>
                  <option>Ticket Minted</option>
                  <option>Royalty Paid</option>
                  <option>Ticket Transfer</option>
                  <option>Event Created</option>
                </select>
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
              </div>
              
              <div className="divide-y divide-slate-700">
                {mockTransactions.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-bold text-white mb-2">No Transactions Yet</h3>
                    <p className="text-gray-400">Transaction history will appear here as events are created and tickets are sold.</p>
                  </div>
                ) : mockTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-6 hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                          <span className="text-xl">{getTransactionIcon(transaction.type)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-bold ${getTransactionColor(transaction.type)}`}>
                              {transaction.description}
                            </span>
                            <span className="text-xs bg-slate-700 text-gray-300 px-2 py-1 rounded">
                              {transaction.blockNumber}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400">{transaction.event}</div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span>📅 {transaction.hash}</span>
                            <span>⏰ {transaction.timestamp}</span>
                            <span>⛽ {transaction.gas}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${getTransactionColor(transaction.type)}`}>
                          {transaction.amount}
                        </div>
                        <Link
                          href={`https://etherscan.io/tx/${transaction.hash}`}
                          target="_blank"
                          className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1 mt-1"
                        >
                          🔗 View on Etherscan
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TransparencyPage;
