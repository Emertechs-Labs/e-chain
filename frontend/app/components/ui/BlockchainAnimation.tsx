'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

export function BlockchainAnimation() {
  const [animationData, setAnimationData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Try to load local animation first, fallback to remote
    fetch('/animations/blockchain-animation.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Local animation not found');
        }
        return response.json();
      })
      .then(data => {
        setAnimationData(data);
      })
      .catch(localError => {
        console.warn('Local animation failed, trying remote:', localError);
        // Fallback to remote animation
        fetch('https://assets4.lottiefiles.com/packages/lf20_9wpyhdbo.json')
          .then(response => response.json())
          .then(data => {
            setAnimationData(data);
          })
          .catch(remoteError => {
            console.error('Both local and remote animations failed:', remoteError);
            setError(remoteError);
          });
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
