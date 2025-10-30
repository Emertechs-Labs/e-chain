'use client';

import dynamic from 'next/dynamic';
import { ClientOnlyPortal } from './ClientOnlyPortal';

// Dynamically import FarcasterAuthModal with SSR disabled
const FarcasterAuthModalComponent = dynamic(
  () => import('./FarcasterAuthModal'),
  { ssr: false }
);

export function FarcasterAuthPortal() {
  return (
    <ClientOnlyPortal>
      <FarcasterAuthModalComponent />
    </ClientOnlyPortal>
  );
}