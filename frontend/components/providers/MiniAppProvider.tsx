/**
 * Mini App Provider for Farcaster Frame Integration
 * Wraps the app with Farcaster SDK context
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import sdk from '@farcaster/miniapp-sdk';

interface MiniAppContextType {
  isReady: boolean;
  user: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  } | null;
  isInFrame: boolean;
}

const MiniAppContext = createContext<MiniAppContextType>({
  isReady: false,
  user: null,
  isInFrame: false,
});

export function MiniAppProvider({ children }: { children: React.ReactNode }) {
  const [context, setContext] = useState<MiniAppContextType>({
    isReady: false,
    user: null,
    isInFrame: false,
  });

  useEffect(() => {
    const initFrame = async () => {
      try {
        // Signal SDK is ready
        await sdk.actions.ready();

        // Get frame context
        const frameContext = await sdk.context;

        if (frameContext) {
          setContext({
            isReady: true,
            user: frameContext.user
              ? {
                  fid: frameContext.user.fid,
                  username: frameContext.user.username,
                  displayName: frameContext.user.displayName,
                  pfpUrl: frameContext.user.pfpUrl,
                }
              : null,
            isInFrame: !!frameContext.client,
          });
        } else {
          // Not in frame environment
          setContext({
            isReady: true,
            user: null,
            isInFrame: false,
          });
        }
      } catch (error) {
        console.error('Frame initialization error:', error);
        // Fallback to non-frame mode
        setContext({
          isReady: true,
          user: null,
          isInFrame: false,
        });
      }
    };

    initFrame();
  }, []);

  return <MiniAppContext.Provider value={context}>{children}</MiniAppContext.Provider>;
}

export function useMiniApp() {
  const context = useContext(MiniAppContext);
  if (context === undefined) {
    throw new Error('useMiniApp must be used within MiniAppProvider');
  }
  return context;
}
