'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useAccessibleId, useFocusManagement } from '../../hooks/useAccessibility';
import { LoadingSpinner } from './LoadingComponents';

interface SearchInputProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export function AccessibleSearchInput({
  onSearch,
  placeholder = 'Search events...',
  isLoading = false,
}: SearchInputProps) {
  const [query, setQuery] = useState('');
  const searchId = useAccessibleId('search');
  const inputId = useAccessibleId('search-input');
  const { focusRef } = useFocusManagement();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query);
    }
  };

  const clearSearch = () => {
    setQuery('');
  };

  return (
    <div ref={focusRef} className="relative">
      <form onSubmit={handleSubmit} role="search" aria-label="Event search">
        <div className="relative">
          <label htmlFor={inputId} className="sr-only">
            Search for events
          </label>

          <div className="relative flex items-center">
            <Search
              className="absolute left-3 h-4 w-4 text-gray-400"
              aria-hidden="true"
            />

            <input
              id={inputId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-10 pr-10 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              aria-describedby={isLoading ? `${searchId}-loading` : undefined}
              aria-autocomplete="list"
              disabled={isLoading}
            />

            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 p-1 text-gray-400 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {isLoading && (
              <div
                id={`${searchId}-loading`}
                className="absolute right-3"
                aria-label="Searching"
              >
                <LoadingSpinner size="sm" className="border-gray-400" />
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
