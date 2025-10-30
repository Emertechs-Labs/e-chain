'use client';

import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';

interface StorageStatus {
  turso: boolean;
  blob: boolean;
  edgeConfig: boolean;
}

export default function StorageDashboard() {
  const [status, setStatus] = useState<StorageStatus>({
    turso: false,
    blob: false,
    edgeConfig: false
  });
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    testStorageServices();
  }, []);

  const testStorageServices = async () => {
    try {
      const response = await fetch('/api/storage-test');
      const data = await response.json();

      if (response.ok) {
        setTestResults(data.data);
        setStatus({
          turso: true, // Assuming if API works, Turso is connected
          blob: !!data.data?.blob,
          edgeConfig: !!data.data?.edgeConfig
        });
      }
    } catch (error) {
      console.error('Storage test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatusIndicator = ({ active, label }: { active: boolean; label: string }) => (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${active ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Storage Dashboard</h1>
        <div className="animate-pulse">Loading storage status...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Storage Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Turso</h3>
          <StatusIndicator active={status.turso} label="Database" />
          <p className="text-sm text-muted-foreground mt-2">
            Relational data storage
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Blob Storage</h3>
          <StatusIndicator active={status.blob} label="Object Store" />
          <p className="text-sm text-muted-foreground mt-2">
            Files & images
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Edge Config</h3>
          <StatusIndicator active={status.edgeConfig} label="Configuration" />
          <p className="text-sm text-muted-foreground mt-2">
            Global settings
          </p>
        </div>
      </div>

      {testResults && (
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Test Results</h3>
          <pre className="text-sm bg-muted p-4 rounded overflow-auto">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={testStorageServices}
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
}