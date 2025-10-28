'use client';

import dynamic from 'next/dynamic';

// Import the client component with dynamic to disable SSR
const ClientMarketplace = dynamic(
  () => import('./ClientMarketplace'),
  { ssr: false }
);

export default function ClientWrapper() {
  return <ClientMarketplace />;
}