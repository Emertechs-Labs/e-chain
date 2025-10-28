'use client';
import { ReactNode } from 'react';

// This is a placeholder for MiniKitProvider
// Will be re-enabled when SSR issues are fixed
export function MiniKitContextProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export default MiniKitContextProvider;