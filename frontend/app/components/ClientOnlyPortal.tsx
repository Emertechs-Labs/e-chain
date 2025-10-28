'use client';

import { useEffect, useState } from 'react';

interface ClientOnlyPortalProps {
  children: React.ReactNode;
}

/**
 * Component that ensures its children are only rendered on the client side
 * Use this for components that rely on browser APIs
 */
export function ClientOnlyPortal({ children }: ClientOnlyPortalProps) {
  const [mounted, setMounted] = useState(false);

  // Only render children after component has mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}