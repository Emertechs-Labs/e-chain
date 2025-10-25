/// <reference types="@types/google.maps" />
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

    // Load the Google Maps API
    const googleMapsScript = document.createElement('script');
    googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geocoding`;
    googleMapsScript.async = true;
    googleMapsScript.defer = true;

    googleMapsScript.onload = () => {
      setIsLoaded(true);
    };

    googleMapsScript.onerror = (error) => {
      console.error('Error loading Google Maps:', error);
      setLoadError(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(googleMapsScript);
  }, []);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}
