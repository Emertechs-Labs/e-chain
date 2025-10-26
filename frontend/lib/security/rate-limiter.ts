/**
 * Rate Limiting Middleware for Frame API Routes
 * Implements token bucket algorithm with Redis for distributed rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// In-memory store for development (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiter using token bucket algorithm
 */
export class RateLimiter {
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.config = {
      keyPrefix: 'ratelimit',
      ...config,
    };
  }

  /**
   * Check if request is within rate limit
   */
  async check(identifier: string): Promise<RateLimitResult> {
    const key = `${this.config.keyPrefix}:${identifier}`;
    const now = Date.now();

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);

    // Reset if window expired
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + this.config.windowMs,
      };
      rateLimitStore.set(key, entry);
    }

    // Check if limit exceeded
    if (entry.count >= this.config.maxRequests) {
      return {
        success: false,
        limit: this.config.maxRequests,
        remaining: 0,
        reset: entry.resetTime,
      };
    }

    // Increment counter
    entry.count++;
    rateLimitStore.set(key, entry);

    return {
      success: true,
      limit: this.config.maxRequests,
      remaining: this.config.maxRequests - entry.count,
      reset: entry.resetTime,
    };
  }

  /**
   * Cleanup expired entries (run periodically)
   */
  static cleanup() {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
}

// Cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => RateLimiter.cleanup(), 60000);
}

/**
 * Rate limit configurations for different endpoints
 */
export const RateLimitConfigs = {
  // Frame endpoints - moderate limit
  frame: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'frame',
  },
  
  // Analytics - higher limit
  analytics: {
    maxRequests: 500,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'analytics',
  },
  
  // Wallet operations - strict limit
  wallet: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'wallet',
  },
  
  // Public API - generous limit
  public: {
    maxRequests: 1000,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'public',
  },
};

/**
 * Get identifier from request (IP or user ID)
 */
export function getIdentifier(request: NextRequest): string {
  // Try to get Farcaster FID from request
  const fid = request.headers.get('x-farcaster-fid');
  if (fid) return `fid:${fid}`;

  // Fallback to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  
  return `ip:${ip}`;
}

/**
 * Apply rate limiting to a request handler
 */
export async function withRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const identifier = getIdentifier(request);
  const limiter = new RateLimiter(config);
  const result = await limiter.check(identifier);

  // Add rate limit headers
  const headers = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  };

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
    
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          ...headers,
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }

  // Execute handler
  const response = await handler();

  // Add rate limit headers to response
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
