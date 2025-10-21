/**
 * API Authentication Middleware
 * 
 * Provides authentication and authorization for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export interface AuthContext {
  address?: string;
  isAuthenticated: boolean;
  isAdmin?: boolean;
}

/**
 * Verify wallet signature for authentication
 */
async function verifyWalletSignature(
  address: string,
  signature: string,
  message: string
): Promise<boolean> {
  try {
    // Import viem for signature verification
    const { verifyMessage } = await import('viem');
    
    const isValid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    return isValid;
  } catch (error) {
    logger.error('Signature verification failed', error);
    return false;
  }
}

/**
 * Extract and verify authentication token from request
 */
async function extractAuthContext(request: NextRequest): Promise<AuthContext> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isAuthenticated: false };
  }

  const token = authHeader.substring(7);

  try {
    // Parse JWT or custom token format
    // Format: address:signature:message:timestamp
    const [address, signature, message, timestamp] = token.split(':');

    // Verify timestamp (valid for 5 minutes)
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 5 * 60 * 1000) {
      logger.warn('Authentication token expired', { address, tokenAge });
      return { isAuthenticated: false };
    }

    // Verify signature
    const isValid = await verifyWalletSignature(address, signature, message);
    
    if (!isValid) {
      logger.warn('Invalid signature', { address });
      return { isAuthenticated: false };
    }

    // Check if admin (from environment or database)
    const adminAddresses = process.env.ADMIN_ADDRESSES?.split(',') || [];
    const isAdmin = adminAddresses.includes(address.toLowerCase());

    return {
      address,
      isAuthenticated: true,
      isAdmin,
    };
  } catch (error) {
    logger.error('Auth token parsing failed', error);
    return { isAuthenticated: false };
  }
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(
  request: NextRequest,
  handler: (request: NextRequest, auth: AuthContext) => Promise<NextResponse>
): Promise<NextResponse> {
  const auth = await extractAuthContext(request);

  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  return handler(request, auth);
}

/**
 * Middleware to require admin privileges
 */
export async function requireAdmin(
  request: NextRequest,
  handler: (request: NextRequest, auth: AuthContext) => Promise<NextResponse>
): Promise<NextResponse> {
  const auth = await extractAuthContext(request);

  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  if (!auth.isAdmin) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Admin privileges required' },
      { status: 403 }
    );
  }

  return handler(request, auth);
}

/**
 * Optional authentication - provides auth context if available
 */
export async function optionalAuth(
  request: NextRequest,
  handler: (request: NextRequest, auth: AuthContext) => Promise<NextResponse>
): Promise<NextResponse> {
  const auth = await extractAuthContext(request);
  return handler(request, auth);
}

/**
 * Generate authentication challenge message
 */
export function generateAuthMessage(address: string, nonce: string): string {
  return `Sign this message to authenticate with Echain:\n\nAddress: ${address}\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;
}

/**
 * Create authentication token
 */
export function createAuthToken(
  address: string,
  signature: string,
  message: string
): string {
  const timestamp = Date.now();
  return `${address}:${signature}:${message}:${timestamp}`;
}
