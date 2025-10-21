/**
 * Example Protected API Route
 * 
 * Demonstrates how to use authentication and rate limiting middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { rateLimit, RateLimitPresets } from '@/lib/middleware/rate-limit';
import { logger } from '@/lib/logger';

/**
 * GET /api/example-protected
 * 
 * Protected endpoint that requires authentication
 */
export async function GET(request: NextRequest) {
  return rateLimit(RateLimitPresets.standard)(request, async (req) => {
    return requireAuth(req, async (request, auth) => {
      logger.api('/api/example-protected', {
        method: 'GET',
        address: auth.address,
      });

      return NextResponse.json({
        success: true,
        message: 'You are authenticated!',
        address: auth.address,
        isAdmin: auth.isAdmin,
      });
    });
  });
}

/**
 * POST /api/example-protected
 * 
 * Protected endpoint with strict rate limiting
 */
export async function POST(request: NextRequest) {
  return rateLimit(RateLimitPresets.strict)(request, async (req) => {
    return requireAuth(req, async (request, auth) => {
      try {
        const body = await request.json();

        logger.api('/api/example-protected', {
          method: 'POST',
          address: auth.address,
          body,
        });

        // Your business logic here
        
        return NextResponse.json({
          success: true,
          message: 'Data processed successfully',
          data: body,
        });
      } catch (error) {
        logger.error('API error', error, {
          endpoint: '/api/example-protected',
          method: 'POST',
        });

        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    });
  });
}
