'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

export function BlockchainAnimation() {
  const [animationData, setAnimationData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load local animation only (no external network fetches)
    fetch('/animations/blockchain-animation.json')
      .then(response => {
        if (!response.ok) throw new Error('Local animation not found');
        return response.json();
      })
      .then(data => {
        setAnimationData(data);
        setIsLoading(false);
      })
      .catch(localError => {
        // Fail silently to avoid noisy console errors in dev/CI.
        console.warn('Local animation failed to load:', localError);
        setError(localError);
        setIsLoading(false);
      });
  }, []);

  if (error || isLoading) {
    // Return a simple animated background as fallback
    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-400/30 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-400/30 rounded-full blur-xl animate-bounce delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
      aria-hidden="true"
    >
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
