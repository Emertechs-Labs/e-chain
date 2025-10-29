import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import React from 'react';
import { frameCache, CacheKeys, CacheTTL } from '@/lib/cache/frame-cache';

export const runtime = 'edge';
export const revalidate = 3600; // 1 hour

/**
 * Dynamic OG Image generation for Farcaster Frames
 * Generates optimized social preview images for events
 * Cached aggressively for CDN distribution (P99 < 100ms)
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const eventId = params.id;
  const { searchParams } = new URL(request.url);
  const quantity = searchParams.get('quantity') || '1';
  const startTime = Date.now();

  try {
    // Check cache for pre-generated image
    const cacheKey = CacheKeys.ogImage(eventId, { quantity });
    const cachedImage = frameCache.get<ArrayBuffer>(cacheKey);

    if (cachedImage) {
      return new Response(cachedImage, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, immutable, max-age=31536000, s-maxage=31536000',
          'CDN-Cache-Control': 'public, max-age=31536000, immutable',
          'Vercel-CDN-Cache-Control': 'public, max-age=31536000, immutable',
          'X-Cache': 'HIT',
          'X-Response-Time': `${Date.now() - startTime}ms`,
        },
      });
    }

    // Fetch event details
    const event = await fetchEventDetails(eventId);

    if (!event) {
      return new Response('Event not found', { status: 404 });
    }

    // Generate dynamic image
    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '60px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              🎟️ Echain
            </div>
          </div>

          {/* Event Info */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '20px',
                lineHeight: 1.2,
              }}
            >
              {event.name}
            </div>

            {event.description && (
              <div
                style={{
                  fontSize: '32px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: '40px',
                }}
              >
                {event.description.substring(0, 100)}
                {event.description.length > 100 ? '...' : ''}
              </div>
            )}

            {/* Event Details */}
            <div
              style={{
                display: 'flex',
                gap: '40px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '20px 30px',
                  borderRadius: '12px',
                }}
              >
                <div
                  style={{
                    fontSize: '20px',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  Price
                </div>
                <div
                  style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  {event.price} ETH
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '20px 30px',
                  borderRadius: '12px',
                }}
              >
                <div
                  style={{
                    fontSize: '20px',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  Date
                </div>
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  {new Date(event.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>

              {quantity !== '1' && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '20px 30px',
                    borderRadius: '12px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '20px',
                      color: 'rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    Quantity
                  </div>
                  <div
                    style={{
                      fontSize: '36px',
                      fontWeight: 'bold',
                      color: 'white',
                    }}
                  >
                    {quantity}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '40px',
            }}
          >
            <div
              style={{
                fontSize: '24px',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              NFT Tickets on Base
            </div>
            <div
              style={{
                fontSize: '24px',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              echain.app
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );

    // Convert to buffer and cache
    const buffer = await imageResponse.arrayBuffer();
    frameCache.set(cacheKey, buffer, CacheTTL.ogImage);

    return new Response(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, immutable, max-age=31536000, s-maxage=31536000',
        'CDN-Cache-Control': 'public, max-age=31536000, immutable',
        'Vercel-CDN-Cache-Control': 'public, max-age=31536000, immutable',
        'X-Cache': 'MISS',
        'X-Response-Time': `${Date.now() - startTime}ms`,
      },
    });
  } catch (error) {
    console.error('OG image generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}

async function fetchEventDetails(eventId: string) {
  // TODO: Replace with actual event fetching
  return {
    id: eventId,
    name: 'Web3 Conference 2025',
    description: 'Join us for the biggest Web3 event of the year',
    price: '0.01',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(),
  };
}
