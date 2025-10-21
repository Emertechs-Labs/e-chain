'use client';

import { useState } from 'react';

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'contract';
  from: string;
  to: string;
  amount: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  hash: string;
  memo?: string;
}

interface TransactionFilterProps {
  transactions: Transaction[];
  onFilteredResults: (filtered: Transaction[]) => void;
}

export function TransactionFilter({ transactions, onFilteredResults }: TransactionFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'send' | 'receive' | 'contract'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'failed'>('all');
  const [dateRange, setDateRange] = useState<'all' | '24h' | '7d' | '30d' | '90d'>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  const applyFilters = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        tx =>
          tx.hash.toLowerCase().includes(query) ||
          tx.from.toLowerCase().includes(query) ||
          tx.to.toLowerCase().includes(query) ||
          tx.memo?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (dateRange) {
        case '24h':
          cutoffDate.setHours(cutoffDate.getHours() - 24);
          break;
        case '7d':
          cutoffDate.setDate(cutoffDate.getDate() - 7);
          break;
        case '30d':
          cutoffDate.setDate(cutoffDate.getDate() - 30);
          break;
        case '90d':
          cutoffDate.setDate(cutoffDate.getDate() - 90);
          break;
      }
      
      filtered = filtered.filter(tx => tx.timestamp >= cutoffDate);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return b.timestamp.getTime() - a.timestamp.getTime();
        case 'date-asc':
          return a.timestamp.getTime() - b.timestamp.getTime();
        case 'amount-desc':
          return parseFloat(b.amount) - parseFloat(a.amount);
        case 'amount-asc':
          return parseFloat(a.amount) - parseFloat(b.amount);
        default:
          return 0;
      }
    });

    onFilteredResults(filtered);
  };

  // Apply filters whenever any filter changes
  useState(() => {
    applyFilters();
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    applyFilters();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter & Search</h3>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by hash, address, or memo..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as any); applyFilters(); }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filter by transaction type"
          >
            <option value="all">All Types</option>
            <option value="send">Sent</option>
            <option value="receive">Received</option>
            <option value="contract">Contract</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as any); applyFilters(); }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filter by transaction status"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => { setDateRange(e.target.value as any); applyFilters(); }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filter by date range"
          >
            <option value="all">All Time</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as any); applyFilters(); }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Sort transactions by"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all' || dateRange !== 'all') && (
        <div className="mt-4 flex flex-wrap gap-2">
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Search: {searchQuery}
              <button onClick={() => handleSearchChange('')} className="hover:bg-blue-200 rounded-full p-0.5" title="Clear search filter" aria-label="Clear search filter">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {typeFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Type: {typeFilter}
              <button onClick={() => { setTypeFilter('all'); applyFilters(); }} className="hover:bg-blue-200 rounded-full p-0.5" title="Clear type filter" aria-label="Clear type filter">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Status: {statusFilter}
              <button onClick={() => { setStatusFilter('all'); applyFilters(); }} className="hover:bg-blue-200 rounded-full p-0.5" title="Clear status filter" aria-label="Clear status filter">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {dateRange !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Range: {dateRange}
              <button onClick={() => { setDateRange('all'); applyFilters(); }} className="hover:bg-blue-200 rounded-full p-0.5" title="Clear date range filter" aria-label="Clear date range filter">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setSearchQuery('');
              setTypeFilter('all');
              setStatusFilter('all');
              setDateRange('all');
              applyFilters();
            }}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
