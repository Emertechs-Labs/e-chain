import { NextRequest, NextResponse } from 'next/server';
// import { getFrameMetadata } from '@coinbase/onchainkit/frame';
import { frameCache, CacheKeys, CacheTTL } from '@/lib/cache/frame-cache';
import { withRateLimit, RateLimitConfigs } from '@/lib/security/rate-limiter';
import { validateEventId, sanitizeHtml, validateQuantity, validateButtonIndex, ValidationError } from '@/lib/security/validation';
import { withSecurityHeaders, handleCors, FARCASTER_CORS_CONFIG } from '@/lib/security/headers';

/**
 * Farcaster Frame endpoint for event sharing
 * Generates dynamic OpenGraph metadata for viral social sharing
 * Optimized for P99 < 1s with aggressive caching
 * Protected with rate limiting, input validation, and XSS prevention
 */

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Handle CORS preflight
  const corsResponse = handleCors(request, FARCASTER_CORS_CONFIG);
  if (corsResponse) return corsResponse;

  const startTime = Date.now();

  return await withRateLimit(request, RateLimitConfigs.frame, async () => {
    try {
      // Validate event ID
      const eventId = validateEventId(params.id);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://echain.app';

      // Check cache first for fast response
      const cacheKey = CacheKeys.frameMetadata(eventId);
      const cachedHTML = frameCache.get<string>(cacheKey);

      if (cachedHTML) {
        const response = new NextResponse(cachedHTML, {
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
            'X-Cache': 'HIT',
            'X-Response-Time': `${Date.now() - startTime}ms`,
          },
        });

        return withSecurityHeaders(response, 'frame');
      }

      // Fetch event details (replace with actual data fetching)
      const event = await fetchEventDetails(eventId);

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      // Sanitize user-generated content
      const safeName = sanitizeHtml(event.name);
      const safeDescription = sanitizeHtml(event.description || 'Get your NFT ticket on Echain');

      // Generate frame metadata
      const frameMetadata = generateFrameMetadata({
        buttons: [
          {
            label: `Get Ticket - ${event.price} ETH`,
            action: 'post',
            target: `${baseUrl}/api/frames/events/${eventId}/purchase`,
          },
          {
            label: 'View Event',
            action: 'link',
            target: `${baseUrl}/events/${eventId}`,
          },
          {
            label: 'Share',
            action: 'post',
            target: `${baseUrl}/api/frames/events/${eventId}/share`,
          },
        ],
        image: {
          src: event.image || `${baseUrl}/api/og/event/${eventId}`,
          aspectRatio: '1.91:1',
        },
        input: {
          text: 'Enter quantity (1-10)',
        },
        postUrl: `${baseUrl}/api/frames/events/${eventId}/action`,
      });

      // Return HTML with frame metadata
      const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${safeName} | Echain</title>
          
          <!-- Farcaster Frame Metadata -->
          ${Object.entries(frameMetadata)
            .map(([key, value]) => `<meta property="${key}" content="${value}" />`)
            .join('\n          ')}
          
          <!-- OpenGraph Metadata -->
          <meta property="og:title" content="${safeName}" />
          <meta property="og:description" content="${safeDescription}" />
          <meta property="og:image" content="${event.image || `${baseUrl}/api/og/event/${eventId}`}" />
          <meta property="og:url" content="${baseUrl}/events/${eventId}" />
          <meta property="og:type" content="website" />
          
          <!-- Twitter Card -->
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${safeName}" />
          <meta name="twitter:description" content="${safeDescription}" />
          <meta name="twitter:image" content="${event.image || `${baseUrl}/api/og/event/${eventId}`}" />
          
          <!-- Auto-redirect to event page -->
          <meta http-equiv="refresh" content="0;url=${baseUrl}/events/${eventId}" />
        </head>
        <body>
          <p>Redirecting to event page...</p>
          <a href="${baseUrl}/events/${eventId}">Click here if not redirected automatically</a>
        </body>
      </html>
    `;

      // Cache the generated HTML
      frameCache.set(cacheKey, html, CacheTTL.frameMetadata);

      const response = new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
          'CDN-Cache-Control': 'public, max-age=600, stale-while-revalidate=86400',
          'Vercel-CDN-Cache-Control': 'public, max-age=600, stale-while-revalidate=86400',
          'X-Cache': 'MISS',
          'X-Response-Time': `${Date.now() - startTime}ms`,
        },
      });

      return withSecurityHeaders(response, 'frame');
    } catch (error) {
      console.error('Frame generation error:', error);

      if (error instanceof ValidationError) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: 'Failed to generate frame' }, { status: 500 });
    }
  });
}

/**
 * Handle frame actions (button clicks)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Handle CORS preflight
  const corsResponse = handleCors(request, FARCASTER_CORS_CONFIG);
  if (corsResponse) return corsResponse;

  return await withRateLimit(request, RateLimitConfigs.frame, async () => {
    try {
      // Validate event ID
      const eventId = validateEventId(params.id);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://echain.app';

      const body = await request.json();
      const { untrustedData } = body;

      // Validate frame message
      // In production, verify with Farcaster Hub API

      // Validate button index
      const buttonIndex = validateButtonIndex(untrustedData?.buttonIndex || 1);
      const inputText = untrustedData?.inputText || '1';

      let responseFrame;

      switch (buttonIndex) {
        case 1: // Purchase ticket
          const quantity = validateQuantity(inputText);
          responseFrame = await handlePurchase(eventId, quantity);
          break;

        case 3: // Share
          responseFrame = await handleShare(eventId);
          break;

        default:
          responseFrame = await getDefaultFrame(eventId);
      }

      const response = NextResponse.json(responseFrame, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      return withSecurityHeaders(response, 'frame');
    } catch (error) {
      console.error('Frame action error:', error);

      if (error instanceof ValidationError) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
    }
  });
}

// Helper functions

async function fetchEventDetails(eventId: string) {
  // TODO: Replace with actual event fetching logic
  // This is a placeholder
  return {
    id: eventId,
    name: 'Sample Event',
    description: 'This is a sample event description',
    image: 'https://via.placeholder.com/1200x630',
    price: '0.01',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(),
  };
}

async function handlePurchase(eventId: string, quantity: number) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://echain.app';

  return {
    image: `${baseUrl}/api/og/event/${eventId}/purchase?quantity=${quantity}`,
    buttons: [
      {
        label: 'Complete Purchase',
        action: 'link',
        target: `${baseUrl}/events/${eventId}?quantity=${quantity}`,
      },
      {
        label: 'Back',
        action: 'post',
        target: `${baseUrl}/api/frames/events/${eventId}`,
      },
    ],
  };
}

async function handleShare(eventId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://echain.app';

  return {
    image: `${baseUrl}/api/og/event/${eventId}/shared`,
    buttons: [
      {
        label: 'Get Your Ticket',
        action: 'post',
        target: `${baseUrl}/api/frames/events/${eventId}`,
      },
    ],
  };
}

async function getDefaultFrame(eventId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://echain.app';
  const event = await fetchEventDetails(eventId);

  return {
    image: event.image || `${baseUrl}/api/og/event/${eventId}`,
    buttons: [
      {
        label: `Get Ticket - ${event.price} ETH`,
        action: 'post',
        target: `${baseUrl}/api/frames/events/${eventId}/purchase`,
      },
      {
        label: 'View Event',
        action: 'link',
        target: `${baseUrl}/events/${eventId}`,
      },
    ],
  };
}

/**
 * Generate Farcaster Frame metadata
 */
function generateFrameMetadata(frameConfig: {
  buttons: Array<{
    label: string;
    action: 'post' | 'link';
    target: string;
  }>;
  image: {
    src: string;
    aspectRatio?: string;
  };
  input?: {
    text: string;
  };
  postUrl?: string;
}) {
  const metadata: Record<string, string> = {
    'fc:frame': 'vNext',
    'fc:frame:image': frameConfig.image.src,
  };

  if (frameConfig.image.aspectRatio) {
    metadata['fc:frame:image:aspect_ratio'] = frameConfig.image.aspectRatio;
  }

  if (frameConfig.input) {
    metadata['fc:frame:input:text'] = frameConfig.input.text;
  }

  if (frameConfig.postUrl) {
    metadata['fc:frame:post_url'] = frameConfig.postUrl;
  }

  frameConfig.buttons.forEach((button, index) => {
    const buttonIndex = index + 1;
    metadata[`fc:frame:button:${buttonIndex}`] = button.label;
    metadata[`fc:frame:button:${buttonIndex}:action`] = button.action;
    metadata[`fc:frame:button:${buttonIndex}:target`] = button.target;
  });

  return metadata;
}
