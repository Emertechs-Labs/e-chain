'use client';

import { ReactNode, useEffect, useState } from 'react';
import MiniKitFallback from '../providers/MiniKitFallback';
import { MiniKitContextProvider } from '../providers/MiniKitProvider';

export function ClientMiniKitWrapper({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Use the fallback component during server-side rendering
  // and switch to the real provider after client-side hydration
  if (!mounted) {
    return <MiniKitFallback>{children}</MiniKitFallback>;
  }
  
  return <MiniKitContextProvider>{children}</MiniKitContextProvider>;
}