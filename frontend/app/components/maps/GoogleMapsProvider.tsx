'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | null;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  loadError: null,
});

export const useGoogleMaps = () => useContext(GoogleMapsContext);

interface GoogleMapsProviderProps {
  children: ReactNode;
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // If no API key, skip loading (component will use fallback)
    if (!apiKey) {
      console.warn('Google Maps API key not found. Using fallback map display.');
      setIsLoaded(false);
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geocoding'],
    });

    loader
      .load()
      .then(() => {
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error('Error loading Google Maps:', error);
        setLoadError(error);
      });
  }, []);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}
