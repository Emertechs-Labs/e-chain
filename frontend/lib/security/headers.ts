/**
 * Security Headers Configuration
 * Implements CSP, CORS, and other security headers
 */

import { NextResponse } from 'next/server';

/**
 * Content Security Policy
 * Prevents XSS, clickjacking, and other code injection attacks
 */
export const CSP_HEADER = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https: http:",
    "media-src 'self' blob: https:",
    "connect-src 'self' https: wss:",
    "frame-src 'self' https://verify.walletconnect.com https://verify.walletconnect.org",
    "frame-ancestors 'self' https://warpcast.com https://*.farcaster.xyz",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; '),
};

/**
 * Strict security headers for sensitive endpoints
 */
export const STRICT_SECURITY_HEADERS = {
  ...CSP_HEADER,
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

/**
 * Frame-specific headers
 * Allows embedding in Farcaster clients
 */
export const FRAME_SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://vercel.live",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: http:",
    "connect-src 'self' https: wss:",
    "frame-ancestors https://warpcast.com https://*.farcaster.xyz https://*.warpcast.com",
  ].join('; '),
  'X-Frame-Options': 'ALLOW-FROM https://warpcast.com',
  'X-Content-Type-Options': 'nosniff',
};

/**
 * CORS configuration
 */
export interface CORSConfig {
  origin?: string | string[];
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Get CORS headers
 */
export function getCorsHeaders(
  origin: string,
  config: CORSConfig = {}
): Record<string, string> {
  const {
    origin: allowedOrigins = '*',
    methods = ['GET', 'POST', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Farcaster-FID'],
    exposedHeaders = ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    credentials = false,
    maxAge = 86400,
  } = config;

  // Check if origin is allowed
  const isOriginAllowed =
    allowedOrigins === '*' ||
    (Array.isArray(allowedOrigins) && allowedOrigins.includes(origin)) ||
    allowedOrigins === origin;

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': methods.join(', '),
    'Access-Control-Allow-Headers': allowedHeaders.join(', '),
    'Access-Control-Max-Age': maxAge.toString(),
  };

  if (isOriginAllowed) {
    headers['Access-Control-Allow-Origin'] = Array.isArray(allowedOrigins)
      ? origin
      : allowedOrigins;
  }

  if (credentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  if (exposedHeaders.length > 0) {
    headers['Access-Control-Expose-Headers'] = exposedHeaders.join(', ');
  }

  return headers;
}

/**
 * Apply security headers to response
 */
export function withSecurityHeaders(
  response: NextResponse,
  type: 'strict' | 'frame' | 'default' = 'default'
): NextResponse {
  const headers = type === 'strict' 
    ? STRICT_SECURITY_HEADERS 
    : type === 'frame'
    ? FRAME_SECURITY_HEADERS
    : CSP_HEADER;

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * CORS middleware for API routes
 */
export function handleCors(
  request: Request,
  config?: CORSConfig
): NextResponse | null {
  const origin = request.headers.get('origin') || '';

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const headers = getCorsHeaders(origin, config);
    return new NextResponse(null, { status: 204, headers });
  }

  return null;
}

/**
 * Apply CORS headers to existing response
 */
export function withCors(
  response: NextResponse,
  origin: string,
  config?: CORSConfig
): NextResponse {
  const corsHeaders = getCorsHeaders(origin, config);
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Farcaster-specific CORS config
 */
export const FARCASTER_CORS_CONFIG: CORSConfig = {
  origin: [
    'https://warpcast.com',
    'https://www.warpcast.com',
    'https://client.warpcast.com',
    'https://farcaster.xyz',
    'https://www.farcaster.xyz',
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Farcaster-FID',
    'X-Frame-Options',
  ],
  credentials: true,
  maxAge: 86400,
};

/**
 * Cache control headers for different content types
 */
export const CACHE_HEADERS = {
  // Immutable static assets (1 year)
  immutable: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
  // Long-lived content (1 week)
  longLived: {
    'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
  },
  // Short-lived content (1 hour)
  shortLived: {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=60',
  },
  // No cache
  noCache: {
    'Cache-Control': 'no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },
  // CDN cache with Edge revalidation
  cdnEdge: {
    'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
    'CDN-Cache-Control': 'max-age=31536000',
    'Vercel-CDN-Cache-Control': 'max-age=31536000',
  },
};

/**
 * Add cache headers to response
 */
export function withCacheHeaders(
  response: NextResponse,
  type: keyof typeof CACHE_HEADERS
): NextResponse {
  const headers = CACHE_HEADERS[type];
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Prevent clickjacking
 */
export function preventClickjacking(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  return response;
}

/**
 * Enable HSTS (HTTP Strict Transport Security)
 */
export function enableHSTS(response: NextResponse): NextResponse {
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  return response;
}
