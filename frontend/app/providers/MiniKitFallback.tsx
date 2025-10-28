'use client';

import { ReactNode } from 'react';

// This is a fallback that simply renders children without any provider
// It will be used during server-side rendering and replaced with the real provider on client-side
export function MiniKitFallback({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export default MiniKitFallback;