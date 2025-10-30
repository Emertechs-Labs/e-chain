'use client';
import { ReactNode } from 'react';
import { baseSepolia } from 'wagmi/chains';

export function MiniKitContextProvider({ children }: { children: ReactNode }) {
  try {
    // Dynamically import the provider to avoid SSR issues
    // Using require instead of import to ensure it's only loaded at runtime
    const { MiniKitProvider } = require('@coinbase/onchainkit/minikit');
    
    return (
      <MiniKitProvider apiKey={process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY} chain={baseSepolia}>
        {children}
      </MiniKitProvider>
    );
  } catch (error) {
    console.error('Error loading MiniKitProvider:', error);
    // Fallback to just rendering children if there's an error
    return <>{children}</>;
  }
}

// Add default export for dynamic import
export default MiniKitContextProvider;