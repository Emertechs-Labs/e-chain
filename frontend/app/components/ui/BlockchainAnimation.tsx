'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

export function BlockchainAnimation() {
  const [animationData, setAnimationData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load local animation only (no external network fetches)
    fetch('/animations/blockchain-animation.json')
      .then(response => {
        if (!response.ok) throw new Error('Local animation not found');
        return response.json();
      })
      .then(data => setAnimationData(data))
      .catch(localError => {
        // Fail silently to avoid noisy console errors in dev/CI.
        console.warn('Local animation failed to load:', localError);
        setError(localError);
      });
  }, []);

  if (error) {
    return null; // Silently fail if animation can't load
  }

  if (!animationData) {
    return null; // Loading state
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
