/**
 * Analytics endpoint for Web Vitals tracking
 * Collects Core Web Vitals metrics for performance monitoring
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface WebVitalsPayload {
  metric: {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    timestamp: number;
  };
  userAgent: string;
  url: string;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const payload: WebVitalsPayload = await request.json();

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', {
        metric: payload.metric.name,
        value: `${payload.metric.value.toFixed(2)}ms`,
        rating: payload.metric.rating,
        url: payload.url,
      });
    }

    // In production, you would send to your analytics service
    // Examples: Vercel Analytics, Google Analytics, DataDog, etc.
    if (process.env.NODE_ENV === 'production') {
      // Send to Vercel Analytics
      if (process.env.VERCEL_ANALYTICS_ID) {
        await fetch('https://vitals.vercel-analytics.com/v1/vitals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dsn: process.env.VERCEL_ANALYTICS_ID,
            id: payload.metric.name,
            page: payload.url,
            href: payload.url,
            event_name: payload.metric.name,
            value: payload.metric.value,
            speed: payload.metric.rating,
          }),
        });
      }

      // Or send to custom analytics endpoint
      // await fetch(process.env.ANALYTICS_ENDPOINT, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Web Vitals tracking error:', error);
    // Return success anyway - don't fail user requests for analytics
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
