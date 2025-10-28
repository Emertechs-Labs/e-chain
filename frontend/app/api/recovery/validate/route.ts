import { NextRequest, NextResponse } from 'next/server';
import { verifyMessage } from 'viem';
import { securityLogger } from '@/lib/security-logger';

// In-memory store for nonces (in production, use Redis or database)
const usedNonces = new Set<string>();
const NONCE_EXPIRY = 5 * 60 * 1000; // 5 minutes

interface RecoveryValidationRequest {
  farcasterUsername: string;
  fid: number;
  addresses: string[];
  signature: `0x${string}`;
  message: string;
  nonce: string;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  let body: RecoveryValidationRequest | undefined;

  try {
    // Get client IP for rate limiting (in production, use proper IP extraction)
    const clientIP = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown';

    // Rate limiting: max 5 recovery attempts per IP per hour
    if (!checkRateLimit(`recovery_${clientIP}`, 5, 60 * 60 * 1000)) {
      securityLogger.rateLimitExceeded('recovery_validate', clientIP);
      return NextResponse.json(
        { error: 'Too many recovery attempts. Please try again later.' },
        { status: 429 }
      );
    }

    body = await request.json();

    if (!body) {
      securityLogger.securityEvent('invalid_request_body', { ip: clientIP });
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Log recovery attempt
    securityLogger.recoveryAttempt(body.farcasterUsername, body.fid, false, {
      ip: clientIP,
      addresses: body.addresses,
    });

    // Validate required fields
    if (!body.farcasterUsername || !body.fid || !body.addresses || !body.signature || !body.message || !body.nonce || !body.timestamp) {
      securityLogger.recoveryFailure(body.farcasterUsername || 'unknown', body.fid || 0, 'missing_required_fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check nonce hasn't been used
    if (usedNonces.has(body.nonce)) {
      securityLogger.recoveryFailure(body.farcasterUsername, body.fid, 'nonce_already_used');
      return NextResponse.json(
        { error: 'Nonce already used' },
        { status: 400 }
      );
    }

    // Check timestamp is within acceptable range (prevent old signatures)
    const now = Date.now();
    const signatureAge = now - body.timestamp;
    if (signatureAge > NONCE_EXPIRY || signatureAge < -60000) { // Allow 1 minute clock skew
      securityLogger.recoveryFailure(body.farcasterUsername, body.fid, 'signature_expired');
      return NextResponse.json(
        { error: 'Signature expired or timestamp invalid' },
        { status: 400 }
      );
    }

    // Verify the message format
    const expectedMessage = `Recover access to Echain account\n\nUsername: ${body.farcasterUsername}\nFID: ${body.fid}\nAddresses: ${body.addresses.join(', ')}\nNonce: ${body.nonce}\nTimestamp: ${body.timestamp}`;

    if (body.message !== expectedMessage) {
      securityLogger.recoveryFailure(body.farcasterUsername, body.fid, 'invalid_message_format');
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    // Verify signature (assuming the signature is from one of the addresses)
    let signatureValid = false;
    let recoveredAddress: string | null = null;

    for (const address of body.addresses) {
      try {
        const recovered = await verifyMessage({
          address: address as `0x${string}`,
          message: body.message,
          signature: body.signature,
        });

        if (recovered) {
          signatureValid = true;
          recoveredAddress = address;
          break;
        }
      } catch (error) {
        // Continue to next address
        continue;
      }
    }

    if (!signatureValid || !recoveredAddress) {
      securityLogger.recoveryFailure(body.farcasterUsername, body.fid, 'invalid_signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Mark nonce as used
    usedNonces.add(body.nonce);
    const nonceToClean = body.nonce;

    // Clean up expired nonces (simple cleanup, in production use proper cache)
    // This is a basic implementation - in production, use Redis with TTL
    setTimeout(() => {
      usedNonces.delete(nonceToClean);
    }, NONCE_EXPIRY);

    // Log the recovery attempt for monitoring
    console.log(`Recovery validation successful for FID ${body.fid}, address ${recoveredAddress}`);
    securityLogger.recoverySuccess(body.farcasterUsername, body.fid, recoveredAddress);

    return NextResponse.json({
      valid: true,
      farcasterUsername: body.farcasterUsername,
      fid: body.fid,
      recoveredAddress,
      timestamp: body.timestamp,
    });

  } catch (error) {
    console.error('Recovery validation error:', error);
    securityLogger.error('recovery_validation', error as Error, {
      farcasterUsername: body?.farcasterUsername,
      fid: body?.fid,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Rate limiting helper (basic implementation)
let requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const windowData = requestCounts.get(identifier);

  if (!windowData || now > windowData.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (windowData.count >= maxRequests) {
    return false;
  }

  windowData.count++;
  return true;
}