# Google Maps Setup Guide

This guide explains how to set up Google Maps integration for the Echain event creation form.

## Features

- **Interactive Map Display**: Visual map preview for event venues
- **Address Autocomplete**: Popular venue suggestions
- **Geocoding**: Convert addresses to coordinates and vice versa
- **Current Location**: Allow users to use their current location
- **Fallback Support**: Works without API key using fallback display
- **Mobile Responsive**: Optimized for all device sizes

## Quick Start

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** > **Library**
4. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
5. Go to **APIs & Services** > **Credentials**
6. Click **Create Credentials** > **API Key**
7. Copy your API key

### 2. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your Google Maps API key:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

### 3. Restrict API Key (Recommended)

For production, restrict your API key:

1. In Google Cloud Console, go to **Credentials**
2. Click on your API key
3. Under **Application restrictions**, select **HTTP referrers**
4. Add your domain (e.g., `yourdomain.com/*`)
5. Under **API restrictions**, select **Restrict key**
6. Choose the APIs you enabled

## Components

### GoogleMapsProvider

Global provider that loads Google Maps API:

```tsx
import { GoogleMapsProvider } from './components/maps/GoogleMapsProvider';

<GoogleMapsProvider>
  <App />
</GoogleMapsProvider>
```

### SimpleLocationPicker

Interactive location picker component:

```tsx
import { SimpleLocationPicker } from './components/maps/SimpleLocationPicker';

<SimpleLocationPicker
  value={address}
  onChange={(address, coordinates) => {
    setAddress(address);
    setCoordinates(coordinates);
  }}
  placeholder="Enter event location"
/>
```

## Features Breakdown

### Popular Venue Suggestions

Predefined popular venues that users can quickly select:
- Convention Centers
- Tech Hubs
- Community Halls
- Auditoriums
- Virtual Events

### Current Location

Users can click the navigation icon to use their current location. Requires browser geolocation permission.

### Interactive Map

- **With API Key**: Full interactive Google Map with draggable marker
- **Without API Key**: Fallback display showing address with map icon

### Geocoding

Automatically converts:
- Addresses → Coordinates (for map display)
- Coordinates → Addresses (when using current location or dragging marker)

## Fallback Behavior

The component gracefully handles missing API keys:

1. **No API Key**: Shows address input with popular venues, no interactive map
2. **API Load Error**: Falls back to simple address display
3. **Geocoding Error**: Continues to work with manual address entry

## Cost Considerations

Google Maps APIs have free tier limits:
- **Maps JavaScript API**: $200 free credit/month
- **Geocoding API**: $200 free credit/month
- **Places API**: $200 free credit/month

For most small to medium events platforms, this should be sufficient.

## Troubleshooting

### Map not displaying

1. Check API key is set in `.env.local`
2. Verify APIs are enabled in Google Cloud Console
3. Check browser console for errors
4. Ensure domain is allowed in API key restrictions

### "This page can't load Google Maps correctly"

This usually means:
1. API key is invalid or not set
2. Required APIs are not enabled
3. Billing is not set up in Google Cloud (required even for free tier)

### Geocoding not working

1. Ensure Geocoding API is enabled
2. Check API key has access to Geocoding API
3. Verify address format is valid

## Development Tips

- Use different API keys for development and production
- Monitor API usage in Google Cloud Console
- Set up budget alerts to avoid unexpected charges
- Consider implementing address caching to reduce API calls

## Security Best Practices

1. **Never commit** `.env.local` to version control
2. Use **HTTP referrer restrictions** in production
3. Set up **API quotas** to prevent abuse
4. Monitor **API usage** regularly
5. Use separate API keys for different environments

## Support

For issues or questions:
- Check [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- Review browser console for error messages
- Ensure all prerequisites are met
