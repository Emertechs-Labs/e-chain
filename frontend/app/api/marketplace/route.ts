import { NextRequest, NextResponse } from 'next/server';
import { readContract } from '../../../lib/contract-wrapper';

// Marketplace listings are now stored on-chain only
// This API returns empty arrays since the Marketplace contract doesn't provide
// efficient enumeration of all listings. Individual listings can be queried by ID.

export async function GET(request: NextRequest) {
  try {
    // For now, return empty array since on-chain marketplace doesn't support
    // efficient enumeration of all listings. This prevents database dependency.
    // In the future, we could implement off-chain indexing or modify the contract.

    const { searchParams } = new URL(request.url);
    const seller = searchParams.get('seller');

    // If querying by seller, we could potentially implement seller-specific queries
    // but for now, return empty to avoid database dependency
    if (seller) {
      return NextResponse.json([]);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error('Marketplace API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Marketplace listings are created via direct contract calls
    // This endpoint is deprecated - use contract interactions instead
    return NextResponse.json({
      error: 'Marketplace listings must be created via contract calls',
      message: 'Use the Marketplace contract listTicket function directly'
    }, { status: 400 });
  } catch (error) {
    console.error('Marketplace API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT endpoint to update listing (deprecated)
export async function PUT(request: NextRequest) {
  try {
    // Marketplace updates are handled via contract calls
    // This endpoint is deprecated - use contract interactions instead
    return NextResponse.json({
      error: 'Marketplace updates must be handled via contract calls',
      message: 'Use the Marketplace contract buyTicket or cancelListing functions directly'
    }, { status: 400 });
  } catch (error) {
    console.error('Marketplace API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}