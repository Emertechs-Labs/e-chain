import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Simple in-memory nonce store (use Redis or database in production)
const nonces = new Set<string>();

export async function GET() {
  try {
    // Generate a secure random nonce
    const nonce = crypto.randomBytes(16).toString('hex');

    // Store the nonce (in production, use Redis or database)
    nonces.add(nonce);

    // Set expiration (in production, use TTL)
    setTimeout(() => {
      nonces.delete(nonce);
    }, 5 * 60 * 1000); // 5 minutes

    return NextResponse.json({ nonce });
  } catch (error) {
    console.error('Error generating nonce:', error);
    return NextResponse.json(
      { error: 'Failed to generate nonce' },
      { status: 500 }
    );
  }
}
