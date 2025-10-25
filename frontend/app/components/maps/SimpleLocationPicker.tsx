'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search } from 'lucide-react';
import { useGoogleMaps } from './GoogleMapsProvider';

interface SimpleLocationPickerProps {
  value: string;
  onChange: (address: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
  className?: string;
}

interface PopularVenue {
  name: string;
  address: string;
  type: string;
}

const POPULAR_VENUES: PopularVenue[] = [
  { name: 'Convention Center', address: 'Moscone Center, San Francisco, CA', type: 'Conference' },
  { name: 'Tech Hub', address: 'Silicon Valley Conference Center, San Jose, CA', type: 'Technology' },
  { name: 'Community Hall', address: 'Community Center, Downtown', type: 'Community' },
  { name: 'Auditorium', address: 'City Auditorium, Main Street', type: 'Performance' },
  { name: 'Virtual Event', address: 'Online - Virtual Platform', type: 'Virtual' },
];

export function SimpleLocationPicker({ 
  value, 
  onChange, 
  placeholder = 'Enter event location',
  className = '' 
}: SimpleLocationPickerProps) {
  const { isLoaded } = useGoogleMaps();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [mapError, setMapError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  // Initialize Google Maps when loaded
  useEffect(() => {
    if (isLoaded && mapRef.current && !googleMapRef.current) {
      try {
        const defaultCenter = { lat: 37.7749, lng: -122.4194 }; // San Francisco
        
        googleMapRef.current = new google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        markerRef.current = new google.maps.Marker({
          map: googleMapRef.current,
          draggable: true,
        });

        // Handle marker drag
        markerRef.current.addListener('dragend', () => {
          const position = markerRef.current?.getPosition();
          if (position) {
            const lat = position.lat();
            const lng = position.lng();
            setCoordinates({ lat, lng });
            geocodeLatLng(lat, lng);
          }
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError(true);
      }
    }
  }, [isLoaded]);

  // Geocode coordinates to address
  const geocodeLatLng = (lat: number, lng: number) => {
    if (!isLoaded || !window.google) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        onChange(results[0].formatted_address, { lat, lng });
      }
    });
  };

  // Geocode address to coordinates
  const geocodeAddress = (address: string) => {
    if (!isLoaded || !window.google) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        setCoordinates({ lat, lng });
        
        if (googleMapRef.current) {
          googleMapRef.current.setCenter({ lat, lng });
          googleMapRef.current.setZoom(15);
        }
        
        if (markerRef.current) {
          markerRef.current.setPosition({ lat, lng });
          markerRef.current.setVisible(true);
        }
      }
    });
  };

  // Handle address input change
  const handleAddressChange = (newAddress: string) => {
    onChange(newAddress);
    
    if (newAddress.length > 3) {
      geocodeAddress(newAddress);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (venue: PopularVenue) => {
    onChange(venue.address);
    setShowSuggestions(false);
    geocodeAddress(venue.address);
  };

  // Get current location
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setCoordinates({ lat, lng });
        geocodeLatLng(lat, lng);

        if (googleMapRef.current) {
          googleMapRef.current.setCenter({ lat, lng });
          googleMapRef.current.setZoom(15);
        }
        
        if (markerRef.current) {
          markerRef.current.setPosition({ lat, lng });
          markerRef.current.setVisible(true);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location');
      }
    );
  };

  // Generate static map URL for fallback
  const getStaticMapUrl = () => {
    if (!coordinates) return null;
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return null;

    return `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=15&size=600x300&markers=color:red%7C${coordinates.lat},${coordinates.lng}&key=${apiKey}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Address Input */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => handleAddressChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder={placeholder}
              className="w-full bg-slate-700 text-white pl-10 pr-4 py-3 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          
          <button
            type="button"
            onClick={handleCurrentLocation}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg border border-slate-600 transition-colors"
            title="Use current location"
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>

        {/* Popular Venue Suggestions */}
        {showSuggestions && (
          <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
            <div className="p-2 border-b border-slate-700">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Search className="w-4 h-4" />
                <span>Popular Venues</span>
              </div>
            </div>
            {POPULAR_VENUES.map((venue, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(venue)}
                className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-white font-medium">{venue.name}</div>
                    <div className="text-sm text-gray-400">{venue.address}</div>
                    <div className="text-xs text-cyan-400 mt-1">{venue.type}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Display */}
      {isLoaded && !mapError ? (
        <div className="relative">
          <div 
            ref={mapRef}
            className="w-full h-64 rounded-lg border border-slate-600 overflow-hidden"
          />
          {coordinates && (
            <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm border border-slate-700">
              📍 {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </div>
          )}
        </div>
      ) : coordinates && getStaticMapUrl() ? (
        // Static map fallback
        <div className="relative">
          <img 
            src={getStaticMapUrl()!}
            alt="Event location map"
            className="w-full h-64 rounded-lg border border-slate-600 object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm border border-slate-700">
            📍 {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </div>
        </div>
      ) : value ? (
        // Iframe fallback when no Google Maps API
        <div className="w-full h-64 rounded-lg border border-slate-600 overflow-hidden bg-slate-700 flex items-center justify-center">
          <div className="text-center text-gray-400 p-6">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-cyan-400" />
            <p className="font-medium text-white mb-1">{value}</p>
            <p className="text-sm">Add Google Maps API key for interactive map</p>
          </div>
        </div>
      ) : null}

      {/* Helpful Info */}
      <div className="text-xs text-gray-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
        <strong className="text-cyan-400">💡 Tip:</strong> Click the navigation icon to use your current location, or select from popular venues. You can also type any address directly.
      </div>
    </div>
  );
}
