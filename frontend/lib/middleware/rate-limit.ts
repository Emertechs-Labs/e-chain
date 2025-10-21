/**
 * Rate Limiting Middleware
 * 
 * Protects API routes from abuse and DoS attacks
 * Uses in-memory storage for development, Redis for production
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for development (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  // Try to get authenticated user address
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const [address] = token.split(':');
    if (address) return `user:${address}`;
  }

  // Fall back to IP address using headers commonly set by proxies (x-forwarded-for, x-real-ip)
  // NextRequest does not expose a direct `ip` property in Next.js runtime.
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  let ip = 'unknown';

  if (forwarded) {
    ip = forwarded.split(',')[0].trim();
  } else if (realIp) {
    ip = realIp.trim();
  } else {
    try {
      // Try to read from the cf-connecting-ip header (Cloudflare) as a last resort
      const cfIp = request.headers.get('cf-connecting-ip');
      if (cfIp) ip = cfIp.trim();
    } catch (e) {
      // ignore
    }
  }

  return `ip:${ip}`;
}

/**
 * Check if request should be rate limited
 */
function checkRateLimit(
  clientId: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(clientId);

  // No previous requests or window expired
  if (!entry || entry.resetTime < now) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(clientId, { count: 1, resetTime });
    return { allowed: true, remaining: config.maxRequests - 1, resetTime };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(clientId, entry);

  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);

  return { allowed, remaining, resetTime: entry.resetTime };
}

/**
 * Rate limiting middleware
 */
export function rateLimit(config: RateLimitConfig) {
  return async (
    request: NextRequest,
    handler: (request: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    const clientId = getClientId(request);
    const { allowed, remaining, resetTime } = checkRateLimit(clientId, config);

    // Add rate limit headers to response
    const addRateLimitHeaders = (response: NextResponse) => {
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', resetTime.toString());
      return response;
    };

    if (!allowed) {
      logger.warn('Rate limit exceeded', {
        clientId,
        limit: config.maxRequests,
        window: config.windowMs,
      });

      const response = NextResponse.json(
        {
          error: 'Too Many Requests',
          message: config.message || 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
        },
        { status: 429 }
      );

      return addRateLimitHeaders(response);
    }

    const response = await handler(request);
    return addRateLimitHeaders(response);
  };
}

/**
 * Predefined rate limit configurations
 */
export const RateLimitPresets = {
  // Strict limits for sensitive operations
  strict: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    message: 'Too many requests. Please try again in 15 minutes.',
  },

  // Standard limits for general API routes
  standard: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'Too many requests. Please try again in a minute.',
  },

  // Relaxed limits for public endpoints
  relaxed: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 120,
    message: 'Too many requests. Please slow down.',
  },

  // Very strict for authentication attempts
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts. Please try again later.',
  },

  // Contract interactions (blockchain operations)
  contract: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Too many contract interactions. Please wait a moment.',
  },
};

/**
 * Redis-based rate limiter for production (optional)
 * Uncomment and configure when Redis is available
 */
/*
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

async function checkRateLimitRedis(
  clientId: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const key = `ratelimit:${clientId}`;
  const now = Date.now();
  const resetTime = now + config.windowMs;

  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.pexpire(key, config.windowMs);
  }

  const allowed = count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - count);

  return { allowed, remaining, resetTime };
}
*/
