'use client';

import { useState } from 'react';
import { LoadingSpinner, LoadingButton, LoadingOverlay, Skeleton } from './ui/LoadingComponents';
import { useErrorHandler, useRetry } from '../hooks/useRetry';

export function ExampleComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<string | null>(null);
  const { error, handleError, resetError, hasError } = useErrorHandler();
  const { executeWithRetry, isRetrying, attempts } = useRetry({
    maxAttempts: 3,
    baseDelay: 1000,
  });

  const fetchData = async () => {
    setIsLoading(true);
    resetError();

    try {
      // Simulate an API call that might fail
      await executeWithRetry(async () => {
        const response = await fetch('/api/example');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.text();
        setData(result);
      });
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[400px] bg-slate-800 rounded-lg p-6">
      {/* Loading overlay for the entire component */}
      <LoadingOverlay
        isVisible={isLoading}
        message="Fetching your data..."
      />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Example Component</h2>

        {/* Loading button example */}
        {isLoading ? (
          <LoadingButton className="bg-cyan-500">
            Loading...
          </LoadingButton>
        ) : (
          <button
            onClick={fetchData}
            className="bg-cyan-500 hover:bg-cyan-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Fetch Data
          </button>
        )}

        {/* Error state */}
        {hasError && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400 mb-2">Error: {error?.message}</p>
            <button
              onClick={fetchData}
              className="text-sm bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Retry indicator */}
        {isRetrying && (
          <div className="text-yellow-400 text-sm">
            Retrying... (Attempt {attempts})
          </div>
        )}

        {/* Data display with skeleton loading */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Data:</h3>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : data ? (
            <p className="text-gray-300">{data}</p>
          ) : (
            <p className="text-gray-500">No data loaded yet</p>
          )}
        </div>

        {/* Different loading spinner sizes */}
        <div className="flex items-center space-x-4">
          <span className="text-white">Spinners:</span>
          <LoadingSpinner size="sm" />
          <LoadingSpinner size="md" />
          <LoadingSpinner size="lg" />
        </div>
      </div>
    </div>
  );
}
