/// <reference types="@types/google.maps" />
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { useGoogleMaps } from './GoogleMapsProvider';

interface EventLocationMapProps {
  venue: string;
  className?: string;
}

export function EventLocationMap({ venue, className = '' }: EventLocationMapProps) {
  const { isLoaded } = useGoogleMaps();
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [mapError, setMapError] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  // Geocode the venue address
  useEffect(() => {
    if (!isLoaded || !window.google || !venue) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: venue }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        setCoordinates({ lat, lng });
      } else {
        console.warn('Geocoding failed:', status);
        setMapError(true);
      }
    });
  }, [isLoaded, venue]);

  // Initialize map when coordinates are available
  useEffect(() => {
    if (isLoaded && mapRef.current && coordinates && !googleMapRef.current) {
      try {
        googleMapRef.current = new google.maps.Map(mapRef.current, {
          center: coordinates,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        });

        markerRef.current = new google.maps.Marker({
          map: googleMapRef.current,
          position: coordinates,
          title: venue,
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError(true);
      }
    } else if (googleMapRef.current && coordinates) {
      // Update existing map
      googleMapRef.current.setCenter(coordinates);
      if (markerRef.current) {
        markerRef.current.setPosition(coordinates);
      }
    }
  }, [isLoaded, coordinates, venue]);

  // Generate static map URL for fallback
  const getStaticMapUrl = () => {
    if (!coordinates) return null;
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return null;

    return `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=15&size=600x400&markers=color:red%7C${coordinates.lat},${coordinates.lng}&key=${apiKey}`;
  };

  // Open in Google Maps
  const openInGoogleMaps = () => {
    if (coordinates) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`, '_blank');
    }
  };

  // If no venue or it's an online event, don't show map
  if (!venue || venue.toLowerCase().includes('online') || venue.toLowerCase().includes('virtual')) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Event Location</h3>
        </div>
        <button
          onClick={openInGoogleMaps}
          className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <span>Open in Maps</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
        <p className="text-slate-300 text-sm">{venue}</p>
      </div>

      {/* Map Display */}
      {isLoaded && !mapError && coordinates ? (
        <div className="relative rounded-lg overflow-hidden border border-slate-700">
          <div 
            ref={mapRef}
            className="w-full h-80"
          />
        </div>
      ) : coordinates && getStaticMapUrl() ? (
        // Static map fallback
        <div 
          className="relative rounded-lg overflow-hidden border border-slate-700 cursor-pointer"
          onClick={openInGoogleMaps}
        >
          <Image 
            src={getStaticMapUrl()!}
            alt={`Map showing ${venue}`}
            width={600}
            height={320}
            className="w-full h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none" />
        </div>
      ) : !mapError ? (
        // Loading state
        <div className="w-full h-80 rounded-lg border border-slate-700 bg-slate-800/50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-3"></div>
            <p className="text-slate-400 text-sm">Loading map...</p>
          </div>
        </div>
      ) : (
        // Error/No API key state
        <div 
          className="w-full h-80 rounded-lg border border-slate-700 bg-slate-800/50 flex items-center justify-center cursor-pointer hover:bg-slate-800/70 transition-colors"
          onClick={openInGoogleMaps}
        >
          <div className="text-center p-6">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-cyan-400" />
            <p className="font-medium text-white mb-2">{venue}</p>
            <p className="text-sm text-slate-400 mb-4">Click to view in Google Maps</p>
            <button className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm">
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
            </button>
          </div>
        </div>
      )}

      {coordinates && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-2">
          <span>Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</span>
          <button 
            onClick={openInGoogleMaps}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            View larger map →
          </button>
        </div>
      )}
    </div>
  );
}
