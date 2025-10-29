import { NextRequest, NextResponse } from 'next/server';
import { readContract } from '../../../../lib/contract-wrapper';
import { CONTRACT_ADDRESSES } from '../../../../lib/contracts';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const address = searchParams.get('address');

    if (!eventId || !address) {
      return NextResponse.json({ error: 'Event ID and address required' }, { status: 400 });
    }

    // Call the hasClaimed function on the POAP contract with automatic fallback
    const hasClaimed = await readContract(
      'POAPAttendance',
      'hasClaimed',
      [eventId, address]
    );

    return NextResponse.json({
      hasClaimed: Boolean(hasClaimed),
      eventId,
      address
    });
  } catch (error) {
    console.error('Error checking POAP claim:', error);
    return NextResponse.json({ error: 'Failed to check POAP claim' }, { status: 500 });
  }
}