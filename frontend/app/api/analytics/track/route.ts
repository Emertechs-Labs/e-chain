/**
 * Analytics Tracking Endpoint
 * Receives and processes analytics events from frames
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface AnalyticsEvent {
  event: string;
  properties: {
    timestamp: number;
    sessionId: string;
    source: string;
    referral?: {
      referrerId?: number;
      referrerUsername?: string;
      source: string;
      campaignId?: string;
    };
    variant?: {
      experimentId: string;
      variantId: string;
      variantName: string;
    };
    [key: string]: any;
  };
}

export async function POST(request: NextRequest) {
  try {
    const event: AnalyticsEvent = await request.json();

    // Validate event structure
    if (!event.event || !event.properties) {
      return NextResponse.json(
        { error: 'Invalid event structure' },
        { status: 400 }
      );
    }

    // Get client info
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const referer = request.headers.get('referer') || 'direct';

    // Enrich event with server-side data
    const enrichedEvent = {
      ...event,
      properties: {
        ...event.properties,
        userAgent,
        ip,
        referer,
        serverTimestamp: Date.now(),
      },
    };

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', {
        event: event.event,
        sessionId: enrichedEvent.properties.sessionId,
        timestamp: new Date(enrichedEvent.properties.timestamp).toISOString(),
        properties: enrichedEvent.properties,
      });
    }

    // In production, send to analytics services
    if (process.env.NODE_ENV === 'production') {
      await Promise.allSettled([
        // Send to Vercel Analytics
        sendToVercelAnalytics(enrichedEvent),
        
        // Send to custom analytics database
        sendToDatabase(enrichedEvent),
        
        // Send to third-party analytics (e.g., Mixpanel, Amplitude)
        sendToThirdParty(enrichedEvent),
      ]);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Return success anyway to not disrupt user experience
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

/**
 * Send to Vercel Analytics
 */
async function sendToVercelAnalytics(event: AnalyticsEvent) {
  if (!process.env.VERCEL_ANALYTICS_ID) return;

  try {
    await fetch('https://vitals.vercel-analytics.com/v1/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dsn: process.env.VERCEL_ANALYTICS_ID,
        event_name: event.event,
        properties: event.properties,
      }),
    });
  } catch (error) {
    console.debug('Vercel Analytics error:', error);
  }
}

/**
 * Send to database (Supabase, PostgreSQL, etc.)
 */
async function sendToDatabase(event: AnalyticsEvent) {
  // TODO: Implement database storage
  // Example with Supabase:
  // const { error } = await supabase
  //   .from('analytics_events')
  //   .insert({
  //     event_name: event.event,
  //     properties: event.properties,
  //     created_at: new Date(event.properties.timestamp).toISOString(),
  //   });
}

/**
 * Send to third-party analytics
 */
async function sendToThirdParty(event: AnalyticsEvent) {
  // Example: Mixpanel, Amplitude, Segment
  if (process.env.ANALYTICS_API_KEY && process.env.ANALYTICS_ENDPOINT) {
    try {
      await fetch(process.env.ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY}`,
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.debug('Third-party analytics error:', error);
    }
  }
}
