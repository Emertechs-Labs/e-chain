import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// Simple in-memory nonce store (use Redis or database in production)
const nonces = new Set<string>();

const client = createPublicClient({
  chain: base,
  transport: http()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, message, signature } = body;

    if (!address || !message || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields: address, message, signature' },
        { status: 400 }
      );
    }

    // Extract nonce from message
    const nonce = message.match(/at (\w{32})$/)?.[1] ||
                 message.match(/Nonce: (\w{32})$/)?.[1];

    if (!nonce) {
      return NextResponse.json(
        { error: 'Invalid message format - nonce not found' },
        { status: 400 }
      );
    }

    // Check if nonce exists and remove it (prevents replay attacks)
    if (!nonces.has(nonce)) {
      return NextResponse.json(
        { error: 'Invalid or reused nonce' },
        { status: 400 }
      );
    }

    nonces.delete(nonce);

    // Verify the signature
    try {
      const valid = await client.verifyMessage({
        address: address as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      });

      if (!valid) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error('Signature verification error:', error);
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 401 }
      );
    }

    // TODO: Create session/JWT here
    // For now, return success
    return NextResponse.json({
      success: true,
      address,
      authenticated: true
    });

  } catch (error) {
    console.error('Authentication verification error:', error);
    return NextResponse.json(
      { error: 'Authentication verification failed' },
      { status: 500 }
    );
  }
}
